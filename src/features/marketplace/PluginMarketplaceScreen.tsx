import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  PluginPurchaseRequestInput,
  PublicPlugin,
  PublicPluginAddon,
  PublicPluginBundle,
  PublicPluginPurchaseRequest,
  disablePlugin,
  enablePlugin,
  listPlugins,
  requestPluginPurchase,
  submitPluginSuggestion,
} from '../../api/pluginsApi';
import { PluginOperationsPanel } from './PluginOperationsPanel';
import { PluginRegistryOverview } from './PluginRegistryOverview';

type AreaFilter = 'ALL' | 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'SHARED' | 'SITE';
type PurchaseFilter = 'ALL' | 'FREE' | 'PAID' | 'BUNDLES' | 'ADDONS' | 'PENDING' | 'UNAVAILABLE' | 'ENABLED';
type MarketplaceSort = 'FEATURED' | 'CHEAPEST' | 'MOST_OPTIONS' | 'PENDING_FIRST' | 'ENABLED_FIRST';
type SuggestionKind = 'plugin' | 'addon';
type PurchaseRequestSelection = Partial<Pick<PluginPurchaseRequestInput, 'optionType' | 'bundleId' | 'addonId'>>;

const AREA_FILTERS: AreaFilter[] = ['ALL', 'HEADMISTRESS', 'MISTRESS', 'SUB', 'SHARED', 'SITE'];
const PURCHASE_FILTERS: { key: PurchaseFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'FREE', label: 'Free' },
  { key: 'PAID', label: 'Paid' },
  { key: 'BUNDLES', label: 'Bundles' },
  { key: 'ADDONS', label: 'Addons' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'UNAVAILABLE', label: 'Unavailable' },
  { key: 'ENABLED', label: 'Enabled' },
];
const MARKETPLACE_SORTS: { key: MarketplaceSort; label: string }[] = [
  { key: 'FEATURED', label: 'Featured' },
  { key: 'CHEAPEST', label: 'Cheapest' },
  { key: 'MOST_OPTIONS', label: 'Most options' },
  { key: 'PENDING_FIRST', label: 'Pending first' },
  { key: 'ENABLED_FIRST', label: 'Enabled first' },
];

function panelStyle(borderColor = '#222') {
  return {
    backgroundColor: '#111',
    borderColor,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function inputStyle() {
  return {
    backgroundColor: '#050505',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    color: '#fff',
    padding: 10,
    marginTop: 6,
  } as const;
}

function formatCredits(value: number | string | null | undefined, currency = 'credits') {
  const amount = Number(value || 0);
  return `${Number.isFinite(amount) ? amount : 0} ${currency}`;
}

function modeLabel(mode: string) {
  return mode.replace(/_/g, ' ');
}

function pendingRequestsForPlugin(plugin: PublicPlugin) {
  if (plugin.currentUserPurchaseRequests?.length) return plugin.currentUserPurchaseRequests;
  return plugin.currentUserPurchaseRequest ? [plugin.currentUserPurchaseRequest] : [];
}

function hasPendingRequests(plugin: PublicPlugin) {
  return pendingRequestsForPlugin(plugin).length > 0;
}

function pluginOptionCount(plugin: PublicPlugin) {
  return Number(plugin.marketplace.purchaseOptions.canBuyFixedLifetime)
    + plugin.marketplace.subscriptionBundles.length
    + plugin.marketplace.addons.length
    + Number(plugin.marketplace.purchaseOptions.canRequestCustom);
}

function pluginMinPrice(plugin: PublicPlugin) {
  const marketplace = plugin.marketplace;
  const prices = [
    marketplace.fixedLifetimePriceCredits,
    marketplace.basePriceCredits,
    ...marketplace.subscriptionBundles.map((bundle) => bundle.priceCredits),
    ...marketplace.addons.map((addon) => addon.priceCredits),
  ].map(Number).filter((price) => Number.isFinite(price) && price > 0);

  return prices.length ? Math.min(...prices) : 0;
}

function pluginBorder(plugin: PublicPlugin) {
  if (!plugin.marketplace.calendarLimit.isAvailableNow) return '#777';
  if (plugin.enabledForCurrentUser) return '#1D9E75';
  if (hasPendingRequests(plugin)) return '#d4af37';
  if (plugin.marketplace.purchaseOptions.canBuyFixedLifetime || plugin.marketplace.purchaseOptions.canSubscribe) return '#d4af37';
  return '#333';
}

function bestPriceLine(plugin: PublicPlugin) {
  const marketplace = plugin.marketplace;
  if (!marketplace.isMarketplaceVisible) return 'Hidden from marketplace';
  if (!marketplace.calendarLimit.isAvailableNow) return `Window ${marketplace.calendarLimit.status}`;
  if (marketplace.monetizationMode === 'free') return 'Free';
  if (marketplace.monetizationMode === 'freemium') return `Freemium / from ${formatCredits(marketplace.basePriceCredits, marketplace.currency)}`;
  if (marketplace.fixedLifetimePriceCredits > 0) return `Lifetime ${formatCredits(marketplace.fixedLifetimePriceCredits, marketplace.currency)}`;
  if (marketplace.subscriptionBundles.length > 0) {
    const lowest = [...marketplace.subscriptionBundles].sort((a, b) => a.priceCredits - b.priceCredits)[0];
    return `Subscription from ${formatCredits(lowest.priceCredits, marketplace.currency)}/${lowest.billingPeriod}`;
  }
  if (marketplace.customRequestEnabled) return 'Custom quote';
  return modeLabel(String(marketplace.monetizationMode));
}

function findPendingRequest(
  requests: PublicPluginPurchaseRequest[],
  optionType: PluginPurchaseRequestInput['optionType'],
  optionId: string,
) {
  return requests.find((request) => request.optionType === optionType && request.optionId === optionId) || null;
}

function OptionPill({ label, tone = '#777' }: { label: string; tone?: string }) {
  return (
    <View style={{ borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: `${tone}18`, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function requestTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('approved')) return '#1D9E75';
  if (normalized.includes('reject') || normalized.includes('declined')) return '#ff6b6b';
  if (normalized.includes('triage') || normalized.includes('planned')) return '#60a5fa';
  return '#d4af37';
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: active ? '#ff0055' : '#222', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10, marginRight: 7, marginBottom: 7 }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function RequestReviewPanel({ requests }: { requests: PublicPluginPurchaseRequest[] }) {
  if (!requests.length) return null;

  return (
    <View style={{ ...panelStyle('#d4af37'), marginTop: 8, marginBottom: 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Request review</Text>
          <Text style={smallText('#aaa')}>Track option requests already sent for this plugin.</Text>
        </View>
        <OptionPill label={`${requests.length} pending`} tone="#d4af37" />
      </View>

      {requests.map((request) => {
        const tone = requestTone(request.status);
        return (
          <View key={request.id} style={{ borderColor: tone, borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 8, backgroundColor: '#151515' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>{request.optionName}</Text>
                <Text style={smallText('#aaa')}>Type: {modeLabel(request.optionType)} / Option: {request.optionId || 'default'}</Text>
              </View>
              <Text style={{ color: tone, fontSize: 11, fontWeight: '900', textAlign: 'right' }}>{request.status.toUpperCase()}</Text>
            </View>
            <Text style={smallText('#d4af37')}>Price: {formatCredits(request.priceCredits, request.currency)}</Text>
            {request.targetUserId ? <Text style={smallText('#777')}>Target: {request.targetUserId}</Text> : null}
            {request.requestedAt ? <Text style={smallText('#777')}>Requested: {new Date(request.requestedAt).toLocaleString()}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function PurchaseOptionCard({
  title,
  subtitle,
  priceLabel,
  meta,
  tone,
  badge,
  pendingRequest,
  disabled,
  buttonLabel,
  onPress,
}: {
  title: string;
  subtitle?: string;
  priceLabel: string;
  meta?: string;
  tone: string;
  badge?: string;
  pendingRequest?: PublicPluginPurchaseRequest | null;
  disabled?: boolean;
  buttonLabel: string;
  onPress: () => void;
}) {
  const isPending = Boolean(pendingRequest);
  const isDisabled = Boolean(disabled || isPending);

  return (
    <View style={{ ...panelStyle(isPending ? '#d4af37' : tone), backgroundColor: '#161616', flexGrow: 1, flexBasis: 210, maxWidth: 360 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          {badge ? <OptionPill label={badge} tone={tone} /> : null}
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>{title}</Text>
          {subtitle ? <Text style={smallText('#aaa')}>{subtitle}</Text> : null}
        </View>
        <Text style={{ color: tone, fontSize: 13, fontWeight: '900', textAlign: 'right' }}>{priceLabel}</Text>
      </View>

      {meta ? <Text style={smallText('#777')}>{meta}</Text> : null}
      {pendingRequest ? <Text style={smallText('#d4af37')}>Pending: {pendingRequest.status} / {pendingRequest.optionName}</Text> : null}

      <Pressable disabled={isDisabled} onPress={onPress} style={{ backgroundColor: isPending ? '#333' : isDisabled ? '#222' : tone, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10, marginTop: 10, alignSelf: 'flex-start', opacity: isDisabled ? 0.8 : 1 }}>
        <Text style={{ color: isPending || isDisabled ? '#bbb' : '#000', fontSize: 11, fontWeight: '900' }}>{isPending ? 'Request Pending' : buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

function bundleBadge(bundle: PublicPluginBundle, index: number) {
  if (index === 0) return 'Entry';
  if (bundle.pluginLimit >= 8 || bundle.addonLimit >= 20) return 'Best value';
  if (bundle.pluginLimit >= 3 || bundle.addonLimit >= 5) return 'Popular';
  return 'Bundle';
}

function matchesPurchaseFilter(plugin: PublicPlugin, filter: PurchaseFilter) {
  const marketplace = plugin.marketplace;
  if (filter === 'ALL') return true;
  if (filter === 'FREE') return marketplace.purchaseOptions.canEnableFree || marketplace.monetizationMode === 'free';
  if (filter === 'PAID') return marketplace.purchaseOptions.canBuyFixedLifetime || marketplace.purchaseOptions.canSubscribe || marketplace.purchaseOptions.canRequestCustom;
  if (filter === 'BUNDLES') return marketplace.subscriptionBundles.length > 0;
  if (filter === 'ADDONS') return marketplace.addons.length > 0;
  if (filter === 'PENDING') return hasPendingRequests(plugin);
  if (filter === 'UNAVAILABLE') return !marketplace.calendarLimit.isAvailableNow;
  if (filter === 'ENABLED') return plugin.enabledForCurrentUser;
  return true;
}

function sortPlugins(plugins: PublicPlugin[], sort: MarketplaceSort) {
  const copy = [...plugins];
  if (sort === 'CHEAPEST') return copy.sort((a, b) => pluginMinPrice(a) - pluginMinPrice(b));
  if (sort === 'MOST_OPTIONS') return copy.sort((a, b) => pluginOptionCount(b) - pluginOptionCount(a));
  if (sort === 'PENDING_FIRST') return copy.sort((a, b) => Number(hasPendingRequests(b)) - Number(hasPendingRequests(a)));
  if (sort === 'ENABLED_FIRST') return copy.sort((a, b) => Number(b.enabledForCurrentUser) - Number(a.enabledForCurrentUser));
  return copy.sort((a, b) => {
    const aScore = Number(a.enabledForCurrentUser) * 4 + Number(hasPendingRequests(a)) * 3 + Number(a.marketplace.calendarLimit.isAvailableNow) * 2 + pluginOptionCount(a);
    const bScore = Number(b.enabledForCurrentUser) * 4 + Number(hasPendingRequests(b)) * 3 + Number(b.marketplace.calendarLimit.isAvailableNow) * 2 + pluginOptionCount(b);
    return bScore - aScore;
  });
}

function PluginCard({ plugin, onEnable, onDisable, onPurchaseRequest, onSuggestionRequest }: { plugin: PublicPlugin; onEnable: () => void; onDisable: () => void; onPurchaseRequest: (selection?: PurchaseRequestSelection) => void; onSuggestionRequest: () => void }) {
  const marketplace = plugin.marketplace;
  const canEnableFree = marketplace.purchaseOptions.canEnableFree && marketplace.calendarLimit.isAvailableNow;
  const purchaseRequests = pendingRequestsForPlugin(plugin);
  const firstBundle = marketplace.subscriptionBundles[0];
  const defaultPurchaseRequest = marketplace.purchaseOptions.canBuyFixedLifetime ? findPendingRequest(purchaseRequests, 'fixed_lifetime', 'fixed_lifetime') : firstBundle ? findPendingRequest(purchaseRequests, 'subscription_bundle', firstBundle.id) : findPendingRequest(purchaseRequests, 'custom_quote', 'custom_quote');
  const canRequestSpecificPaid = marketplace.calendarLimit.isAvailableNow;
  const canRequestPaid = !defaultPurchaseRequest && marketplace.calendarLimit.isAvailableNow && (marketplace.purchaseOptions.canBuyFixedLifetime || marketplace.purchaseOptions.canSubscribe || marketplace.purchaseOptions.canRequestCustom);
  const optionCount = pluginOptionCount(plugin);

  return (
    <View style={panelStyle(pluginBorder(plugin))}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>{plugin.name}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{plugin.area} / {modeLabel(String(marketplace.monetizationMode))}</Text>
        </View>
        <Text style={{ color: plugin.enabledForCurrentUser ? '#1D9E75' : '#d4af37', fontSize: 11, fontWeight: '900' }}>{plugin.enabledForCurrentUser ? 'ENABLED' : plugin.status}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        <OptionPill label={bestPriceLine(plugin)} tone="#d4af37" />
        <OptionPill label={`${optionCount} option${optionCount === 1 ? '' : 's'}`} tone="#ff9abf" />
        <OptionPill label={marketplace.calendarLimit.status} tone={marketplace.calendarLimit.isAvailableNow ? '#1D9E75' : '#777'} />
        {marketplace.customRequestEnabled ? <OptionPill label="Custom quote" tone="#60a5fa" /> : null}
      </View>

      {plugin.description ? <Text style={{ color: '#ddd', marginTop: 8 }}>{plugin.description}</Text> : null}
      <Text style={smallText('#777')}>License: {marketplace.license.type} / Plugin limit: {marketplace.license.pluginLimit || 'full suite'} / Addon limit: {marketplace.license.addonLimit}</Text>
      <Text style={smallText('#777')}>Marketplace window: {marketplace.calendarLimit.status} / Suggestions: {marketplace.suggestionBoxEnabled ? 'open' : 'closed'} / Custom: {marketplace.customRequestEnabled ? 'open' : 'closed'}</Text>

      <View style={{ ...panelStyle('#333'), marginTop: 10, marginBottom: 0 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>Purchase options</Text>
        <Text style={smallText('#aaa')}>Compare lifetime, bundle, addon and custom request paths before sending a request.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {marketplace.purchaseOptions.canBuyFixedLifetime ? <PurchaseOptionCard title="Fixed lifetime license" subtitle="One request for long-term access to this plugin." priceLabel={formatCredits(marketplace.fixedLifetimePriceCredits, marketplace.currency)} meta="Best for permanent access without a recurring bundle." tone="#d4af37" badge="Lifetime" pendingRequest={findPendingRequest(purchaseRequests, 'fixed_lifetime', 'fixed_lifetime')} disabled={!canRequestSpecificPaid} buttonLabel="Request Lifetime" onPress={() => onPurchaseRequest({ optionType: 'fixed_lifetime' })} /> : null}
          {marketplace.subscriptionBundles.slice(0, 4).map((bundle, index) => <PurchaseOptionCard key={bundle.id} title={bundle.name} subtitle={`Recurring ${bundle.billingPeriod} bundle.`} priceLabel={`${formatCredits(bundle.priceCredits, marketplace.currency)} / ${bundle.billingPeriod}`} meta={`Plugins: ${bundle.pluginLimit || 'full suite'} / Addons: ${bundle.addonLimit}`} tone={index === 0 ? '#60a5fa' : '#1D9E75'} badge={bundleBadge(bundle, index)} pendingRequest={findPendingRequest(purchaseRequests, 'subscription_bundle', bundle.id)} disabled={!canRequestSpecificPaid || !marketplace.purchaseOptions.canSubscribe} buttonLabel="Request Bundle" onPress={() => onPurchaseRequest({ optionType: 'subscription_bundle', bundleId: bundle.id })} />)}
          {marketplace.addons.slice(0, 4).map((addon: PublicPluginAddon) => <PurchaseOptionCard key={addon.id} title={addon.name} subtitle={addon.description || 'Optional add-on for this plugin.'} priceLabel={formatCredits(addon.priceCredits, marketplace.currency)} meta={`Window: ${addon.calendarLimit.status}`} tone="#ff9abf" badge="Addon" pendingRequest={findPendingRequest(purchaseRequests, 'addon', addon.id)} disabled={!canRequestSpecificPaid || !addon.calendarLimit.isAvailableNow} buttonLabel="Request Addon" onPress={() => onPurchaseRequest({ optionType: 'addon', addonId: addon.id })} />)}
          {marketplace.purchaseOptions.canRequestCustom ? <PurchaseOptionCard title="Custom quote" subtitle="Ask admin to scope a custom setup or special plugin variation." priceLabel="Quote" meta="Useful when none of the listed options fit." tone="#f97316" badge="Custom" pendingRequest={findPendingRequest(purchaseRequests, 'custom_quote', 'custom_quote')} disabled={!canRequestSpecificPaid} buttonLabel="Request Quote" onPress={() => onPurchaseRequest({ optionType: 'custom_quote' })} /> : null}
        </View>
      </View>

      <RequestReviewPanel requests={purchaseRequests} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {plugin.enabledForCurrentUser ? <Pressable onPress={onDisable} style={{ backgroundColor: '#441122', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, marginBottom: 8 }}><Text style={{ color: '#fff', fontWeight: '900' }}>Disable</Text></Pressable> : canEnableFree ? <Pressable onPress={onEnable} style={{ backgroundColor: '#1D9E75', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, marginBottom: 8 }}><Text style={{ color: '#fff', fontWeight: '900' }}>Enable Free Access</Text></Pressable> : null}
        {defaultPurchaseRequest ? <View style={{ backgroundColor: '#333', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, marginBottom: 8 }}><Text style={{ color: '#d4af37', fontWeight: '900' }}>Purchase Pending</Text></View> : canRequestPaid ? <Pressable onPress={() => onPurchaseRequest()} style={{ backgroundColor: '#d4af37', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, marginBottom: 8 }}><Text style={{ color: '#000', fontWeight: '900' }}>Request Best Option</Text></Pressable> : null}
        {marketplace.suggestionBoxEnabled ? <Pressable onPress={onSuggestionRequest} style={{ backgroundColor: '#222', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 }}><Text style={{ color: '#fff', fontWeight: '900' }}>Suggest Addon</Text></Pressable> : null}
      </View>
    </View>
  );
}

export function PluginMarketplaceScreen() {
  const [plugins, setPlugins] = useState<PublicPlugin[]>([]);
  const [areaFilter, setAreaFilter] = useState<AreaFilter>('ALL');
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>('ALL');
  const [marketplaceSort, setMarketplaceSort] = useState<MarketplaceSort>('FEATURED');
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [suggestionKind, setSuggestionKind] = useState<SuggestionKind>('plugin');
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionDescription, setSuggestionDescription] = useState('');
  const [suggestionBudget, setSuggestionBudget] = useState('');
  const [contactPreference, setContactPreference] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visiblePlugins = useMemo(() => plugins.filter((plugin) => plugin.marketplace.isMarketplaceVisible), [plugins]);
  const filteredPlugins = useMemo(() => sortPlugins(
    visiblePlugins
      .filter((plugin) => areaFilter === 'ALL' || plugin.area === areaFilter)
      .filter((plugin) => matchesPurchaseFilter(plugin, purchaseFilter)),
    marketplaceSort,
  ), [visiblePlugins, areaFilter, purchaseFilter, marketplaceSort]);
  const selectedPlugin = useMemo(() => plugins.find((plugin) => plugin.id === selectedPluginId) || null, [plugins, selectedPluginId]);
  const summary = useMemo(() => ({
    listed: visiblePlugins.length,
    enabled: visiblePlugins.filter((plugin) => plugin.enabledForCurrentUser).length,
    paid: visiblePlugins.filter((plugin) => plugin.marketplace.purchaseOptions.canBuyFixedLifetime || plugin.marketplace.purchaseOptions.canSubscribe).length,
    addons: visiblePlugins.reduce((sum, plugin) => sum + plugin.marketplace.purchaseOptions.addonCount, 0),
  }), [visiblePlugins]);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const data = await listPlugins();
      setPlugins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugin marketplace failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(plugin: PublicPlugin) {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      await enablePlugin(plugin.id);
      setMessage(`${plugin.name} enabled.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugin enable failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable(plugin: PublicPlugin) {
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      await disablePlugin(plugin.id);
      setMessage(`${plugin.name} disabled.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugin disable failed');
    } finally {
      setSaving(false);
    }
  }

  function openSuggestion(plugin: PublicPlugin, kind: SuggestionKind = 'addon') {
    setSelectedPluginId(plugin.id);
    setSuggestionKind(kind);
    setSuggestionTitle(kind === 'addon' ? `${plugin.name} addon request` : `${plugin.name} request`);
    setSuggestionDescription('');
    setSuggestionBudget('');
    setMessage(null);
    setError(null);
  }

  async function handlePurchaseRequest(plugin: PublicPlugin, selection: PurchaseRequestSelection = {}) {
    const marketplace = plugin.marketplace;
    const firstBundle = marketplace.subscriptionBundles[0];
    const optionType: PluginPurchaseRequestInput['optionType'] = selection.optionType || (marketplace.purchaseOptions.canBuyFixedLifetime ? 'fixed_lifetime' : firstBundle ? 'subscription_bundle' : 'custom_quote');
    const bundleId = optionType === 'subscription_bundle' ? selection.bundleId || firstBundle?.id : undefined;
    const addonId = optionType === 'addon' ? selection.addonId : undefined;

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const receipt = await requestPluginPurchase({ pluginId: plugin.id, optionType, bundleId, addonId, note: `Marketplace request from Plugin Marketplace screen for ${plugin.name}.`, metadata: { source: 'plugin-marketplace-screen', displayedPrice: bestPriceLine(plugin), requestedOptionType: optionType, requestedBundleId: bundleId, requestedAddonId: addonId } });
      setMessage(receipt.alreadyRequested ? `Purchase request already pending for ${receipt.optionName}.` : `Purchase request sent for ${receipt.optionName}.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase request failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitSuggestion() {
    const title = suggestionTitle.trim();
    const description = suggestionDescription.trim();
    if (!title || !description) {
      setError('Suggestion title and description are required.');
      return;
    }
    if (suggestionKind === 'addon' && !selectedPluginId) {
      setError('Choose a target plugin for addon suggestions.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const receipt = await submitPluginSuggestion({ kind: suggestionKind, pluginId: suggestionKind === 'addon' ? selectedPluginId || undefined : undefined, requestedCategory: suggestionKind === 'addon' ? selectedPlugin?.area : areaFilter === 'ALL' ? undefined : areaFilter, title, description, budgetCredits: suggestionBudget.trim() ? Number(suggestionBudget) : undefined, contactPreference: contactPreference.trim() || undefined, metadata: { source: 'plugin-marketplace-screen', selectedPluginId } });
      setMessage(`Suggestion received: ${receipt.title}`);
      setSuggestionTitle('');
      setSuggestionDescription('');
      setSuggestionBudget('');
      setContactPreference('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suggestion submit failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>Plugin Marketplace</Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>Browse enabled platform plugins, compare pricing, request bundles and addons, or send custom plugin requests to the admin queue.</Text>
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {message ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{message}</Text> : null}
      {saving ? <Text style={{ color: '#999', marginBottom: 10 }}>Saving...</Text> : null}

      <PluginRegistryOverview />
      <Pressable onPress={refresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}><Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>{loading ? 'Loading...' : 'Refresh Plugin Marketplace'}</Text></Pressable>
      <PluginOperationsPanel plugins={plugins} visiblePluginCount={visiblePlugins.length} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        <View style={{ ...panelStyle(), width: '48%', marginRight: '2%' }}><Text style={smallText('#aaa')}>Listed</Text><Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{summary.listed}</Text></View>
        <View style={{ ...panelStyle(), width: '48%' }}><Text style={smallText('#aaa')}>Enabled</Text><Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{summary.enabled}</Text></View>
        <View style={{ ...panelStyle(), width: '48%', marginRight: '2%' }}><Text style={smallText('#aaa')}>Paid options</Text><Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{summary.paid}</Text></View>
        <View style={{ ...panelStyle(), width: '48%' }}><Text style={smallText('#aaa')}>Addons</Text><Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{summary.addons}</Text></View>
      </View>

      <View style={panelStyle('#333')}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Marketplace controls</Text>
        <Text style={smallText('#aaa')}>Filter by area, option type, request state and sort order.</Text>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 10 }}>Area</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>{AREA_FILTERS.map((area) => <FilterChip key={area} label={area} active={areaFilter === area} onPress={() => setAreaFilter(area)} />)}</View>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 10 }}>Options</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>{PURCHASE_FILTERS.map((filter) => <FilterChip key={filter.key} label={filter.label} active={purchaseFilter === filter.key} onPress={() => setPurchaseFilter(filter.key)} />)}</View>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 10 }}>Sort</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>{MARKETPLACE_SORTS.map((sort) => <FilterChip key={sort.key} label={sort.label} active={marketplaceSort === sort.key} onPress={() => setMarketplaceSort(sort.key)} />)}</View>
        <Text style={smallText('#777')}>Showing {filteredPlugins.length} of {visiblePlugins.length} marketplace plugins.</Text>
      </View>

      {filteredPlugins.map((plugin) => <PluginCard key={plugin.id} plugin={plugin} onEnable={() => handleEnable(plugin)} onDisable={() => handleDisable(plugin)} onPurchaseRequest={(selection) => handlePurchaseRequest(plugin, selection)} onSuggestionRequest={() => openSuggestion(plugin, plugin.marketplace.addons.length > 0 ? 'addon' : 'plugin')} />)}
      {!loading && filteredPlugins.length === 0 ? <Text style={{ color: '#777', marginBottom: 12 }}>No visible plugins match this filter.</Text> : null}

      <View style={panelStyle('#d4af37')}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Suggestion box</Text>
        <Text style={smallText('#aaa')}>Ask for a new plugin, a custom plugin, or an addon for an existing plugin. Admin can triage and price it from the admin queue.</Text>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 10 }}>Kind</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}><FilterChip label="Plugin" active={suggestionKind === 'plugin'} onPress={() => setSuggestionKind('plugin')} /><FilterChip label="Addon" active={suggestionKind === 'addon'} onPress={() => setSuggestionKind('addon')} /></View>
        {suggestionKind === 'addon' ? <><Text style={{ color: '#ff9abf', fontWeight: '900', marginTop: 10 }}>Target plugin</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>{visiblePlugins.map((plugin) => <FilterChip key={plugin.id} label={plugin.name} active={selectedPluginId === plugin.id} onPress={() => setSelectedPluginId(plugin.id)} />)}</View></> : null}
        <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>Title</Text>
        <TextInput value={suggestionTitle} onChangeText={setSuggestionTitle} style={inputStyle()} placeholder="Custom plugin or addon name" placeholderTextColor="#777" />
        <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>Description</Text>
        <TextInput value={suggestionDescription} onChangeText={setSuggestionDescription} style={{ ...inputStyle(), minHeight: 80 }} multiline placeholder="What should it do, who needs it, and what would make it worth paying for?" placeholderTextColor="#777" />
        <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>Budget credits</Text>
        <TextInput value={suggestionBudget} onChangeText={setSuggestionBudget} keyboardType="numeric" style={inputStyle()} placeholder="Optional" placeholderTextColor="#777" />
        <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', marginTop: 10 }}>Contact preference</Text>
        <TextInput value={contactPreference} onChangeText={setContactPreference} style={inputStyle()} placeholder="Optional" placeholderTextColor="#777" />
        <Pressable disabled={saving} onPress={handleSubmitSuggestion} style={{ backgroundColor: '#d4af37', opacity: saving ? 0.65 : 1, padding: 10, borderRadius: 10, marginTop: 12 }}><Text style={{ color: '#000', textAlign: 'center', fontWeight: '900' }}>Send Suggestion</Text></Pressable>
      </View>
    </ScrollView>
  );
}
