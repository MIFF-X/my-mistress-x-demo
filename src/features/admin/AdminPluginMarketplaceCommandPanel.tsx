import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  AdminPlugin,
  AdminPluginLicenseType,
  AdminPluginMarketplaceAddon,
  AdminPluginMarketplaceBundle,
  AdminPluginMarketplaceSettings,
  AdminPluginMonetizationMode,
  AdminPluginSuggestionRequestType,
  AdminPluginStatus,
  AdminPluginSuggestion,
  AdminPluginSuggestionList,
  AdminPluginSuggestionStatus,
  createAdminPlugin,
  listAdminPluginSuggestions,
  reviewAdminPluginSuggestion,
  updateAdminPluginMarketplaceSettings,
} from '../../api/adminCommandApi';

type Props = {
  plugins: AdminPlugin[];
  onPluginCreated: (plugin: AdminPlugin) => void;
  onPluginUpdated: (plugin: AdminPlugin) => void;
};

type JsonRecord = Record<string, unknown>;

type MarketplaceFormState = {
  monetizationMode: AdminPluginMonetizationMode;
  licenseType: AdminPluginLicenseType;
  currency: string;
  basePriceCredits: string;
  fixedLifetimePriceCredits: string;
  pluginLimit: string;
  addonLimit: string;
  isMarketplaceVisible: boolean;
  suggestionBoxEnabled: boolean;
  customRequestEnabled: boolean;
  startsAt: string;
  endsAt: string;
  timezone: string;
  starterBundlePrice: string;
  suiteBundlePrice: string;
  addonEnabled: boolean;
  addonName: string;
  addonDescription: string;
  addonPriceCredits: string;
  addonStartsAt: string;
  addonEndsAt: string;
};

type CreatePluginFormState = {
  id: string;
  name: string;
  area: string;
  description: string;
};

const MONETIZATION_MODES: AdminPluginMonetizationMode[] = [
  'free',
  'freemium',
  'fixed_price',
  'subscription_bundle',
  'custom_quote',
];
const LICENSE_TYPES: AdminPluginLicenseType[] = [
  'full_suite',
  'pick_plugins',
  'pick_plugins_and_addons',
  'fixed_lifetime',
  'custom',
];
const SUGGESTION_FILTERS: Array<AdminPluginSuggestionStatus | 'all'> = [
  'all',
  'new',
  'triaged',
  'approved',
  'planned',
  'built',
  'declined',
];
const REQUEST_TYPE_FILTERS: Array<AdminPluginSuggestionRequestType | 'all'> = ['all', 'suggestion', 'purchase'];
const REVIEW_ACTIONS: Array<{ status: Exclude<AdminPluginSuggestionStatus, 'new'>; label: string; color: string }> = [
  { status: 'triaged', label: 'Triaged', color: '#ff9abf' },
  { status: 'approved', label: 'Approve', color: '#d4af37' },
  { status: 'planned', label: 'Plan', color: '#777' },
  { status: 'built', label: 'Built', color: '#1D9E75' },
  { status: 'declined', label: 'Decline', color: '#441122' },
];

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function textOf(value: unknown, fallback = '') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

function numberOf(value: unknown, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
}

function boolOf(value: unknown, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T) {
  const normalized = String(value || fallback) as T;
  return allowed.includes(normalized) ? normalized : fallback;
}

function slugify(value: string, fallback: string) {
  const id = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || fallback;
}

function marketplaceOf(plugin?: AdminPlugin | null) {
  return asRecord(asRecord(plugin?.permissions).marketplace);
}

function defaultMarketplaceForm(): MarketplaceFormState {
  return {
    monetizationMode: 'freemium',
    licenseType: 'pick_plugins_and_addons',
    currency: 'credits',
    basePriceCredits: '0',
    fixedLifetimePriceCredits: '0',
    pluginLimit: '3',
    addonLimit: '20',
    isMarketplaceVisible: true,
    suggestionBoxEnabled: true,
    customRequestEnabled: true,
    startsAt: '',
    endsAt: '',
    timezone: 'UTC',
    starterBundlePrice: '0',
    suiteBundlePrice: '0',
    addonEnabled: true,
    addonName: '',
    addonDescription: '',
    addonPriceCredits: '0',
    addonStartsAt: '',
    addonEndsAt: '',
  };
}

function formFromPlugin(plugin?: AdminPlugin | null): MarketplaceFormState {
  const fallback = defaultMarketplaceForm();
  const marketplace = marketplaceOf(plugin);
  const license = asRecord(marketplace.license);
  const calendarLimit = asRecord(marketplace.calendarLimit);
  const bundles = asArray<Partial<AdminPluginMarketplaceBundle>>(marketplace.subscriptionBundles);
  const addons = asArray<Partial<AdminPluginMarketplaceAddon>>(marketplace.addons);
  const starterBundle = bundles.find((bundle) => Number(bundle.pluginLimit) === 3) || bundles[0] || {};
  const suiteBundle = bundles.find((bundle) => Number(bundle.pluginLimit) === 8 || Number(bundle.addonLimit) === 20) || bundles[1] || {};
  const firstAddon = addons[0] || {};
  const firstAddonCalendar = asRecord(firstAddon.calendarLimit);

  return {
    monetizationMode: oneOf(marketplace.monetizationMode, MONETIZATION_MODES, fallback.monetizationMode),
    licenseType: oneOf(license.type ?? marketplace.licenseType, LICENSE_TYPES, fallback.licenseType),
    currency: textOf(marketplace.currency, fallback.currency),
    basePriceCredits: textOf(marketplace.basePriceCredits, fallback.basePriceCredits),
    fixedLifetimePriceCredits: textOf(marketplace.fixedLifetimePriceCredits, fallback.fixedLifetimePriceCredits),
    pluginLimit: textOf(license.pluginLimit ?? marketplace.pluginLimit, fallback.pluginLimit),
    addonLimit: textOf(license.addonLimit ?? marketplace.addonLimit, fallback.addonLimit),
    isMarketplaceVisible: boolOf(marketplace.isMarketplaceVisible, fallback.isMarketplaceVisible),
    suggestionBoxEnabled: boolOf(marketplace.suggestionBoxEnabled, fallback.suggestionBoxEnabled),
    customRequestEnabled: boolOf(marketplace.customRequestEnabled, fallback.customRequestEnabled),
    startsAt: textOf(calendarLimit.startsAt ?? marketplace.startsAt),
    endsAt: textOf(calendarLimit.endsAt ?? marketplace.endsAt),
    timezone: textOf(calendarLimit.timezone ?? marketplace.timezone, fallback.timezone),
    starterBundlePrice: textOf(starterBundle.priceCredits, fallback.starterBundlePrice),
    suiteBundlePrice: textOf(suiteBundle.priceCredits, fallback.suiteBundlePrice),
    addonEnabled: boolOf(firstAddon.isEnabled, fallback.addonEnabled),
    addonName: textOf(firstAddon.name),
    addonDescription: textOf(firstAddon.description),
    addonPriceCredits: textOf(firstAddon.priceCredits, fallback.addonPriceCredits),
    addonStartsAt: textOf(firstAddonCalendar.startsAt ?? (firstAddon as JsonRecord).startsAt),
    addonEndsAt: textOf(firstAddonCalendar.endsAt ?? (firstAddon as JsonRecord).endsAt),
  };
}

function buildMarketplaceSettings(form: MarketplaceFormState, previous: JsonRecord = {}): AdminPluginMarketplaceSettings {
  const previousBundles = asArray<Partial<AdminPluginMarketplaceBundle>>(previous.subscriptionBundles);
  const previousAddons = asArray<Partial<AdminPluginMarketplaceAddon>>(previous.addons);
  const starterPrevious = previousBundles[0] || {};
  const suitePrevious = previousBundles[1] || {};
  const addonPrevious = previousAddons[0] || {};
  const addonName = form.addonName.trim();
  const preservedAddons = previousAddons.map((addon, index) => ({
    id: textOf(addon.id, `addon-${index + 1}`),
    name: textOf(addon.name, `Addon ${index + 1}`),
    description: textOf(addon.description),
    priceCredits: numberOf(addon.priceCredits),
    isEnabled: boolOf(addon.isEnabled, true),
    startsAt: textOf(asRecord(addon.calendarLimit).startsAt ?? addon.startsAt) || null,
    endsAt: textOf(asRecord(addon.calendarLimit).endsAt ?? addon.endsAt) || null,
  }));

  return {
    isMarketplaceVisible: form.isMarketplaceVisible,
    isFreemium: form.monetizationMode === 'freemium',
    monetizationMode: form.monetizationMode,
    currency: form.currency.trim() || 'credits',
    basePriceCredits: numberOf(form.basePriceCredits),
    fixedLifetimePriceCredits: numberOf(form.fixedLifetimePriceCredits),
    suggestionBoxEnabled: form.suggestionBoxEnabled,
    customRequestEnabled: form.customRequestEnabled,
    adminToolsEnabled: true,
    startsAt: form.startsAt.trim() || null,
    endsAt: form.endsAt.trim() || null,
    timezone: form.timezone.trim() || 'UTC',
    licenseType: form.licenseType,
    pluginLimit: Math.trunc(numberOf(form.pluginLimit, form.licenseType === 'full_suite' ? 0 : 3)),
    addonLimit: Math.trunc(numberOf(form.addonLimit, form.licenseType === 'pick_plugins_and_addons' ? 20 : 0)),
    subscriptionBundles: [
      {
        ...starterPrevious,
        id: textOf(starterPrevious.id, 'pick-3'),
        name: textOf(starterPrevious.name, 'Pick 3 plugin bundle'),
        priceCredits: numberOf(form.starterBundlePrice),
        billingPeriod: textOf(starterPrevious.billingPeriod, 'monthly'),
        pluginLimit: 3,
        addonLimit: 0,
      },
      {
        ...suitePrevious,
        id: textOf(suitePrevious.id, 'pick-8-addons-20'),
        name: textOf(suitePrevious.name, 'Pick 8 plugins plus 20 addons'),
        priceCredits: numberOf(form.suiteBundlePrice),
        billingPeriod: textOf(suitePrevious.billingPeriod, 'monthly'),
        pluginLimit: 8,
        addonLimit: 20,
      },
    ],
    addons: addonName
      ? [
          {
            ...addonPrevious,
            id: textOf(addonPrevious.id, slugify(addonName, 'addon-1')),
            name: addonName,
            description: form.addonDescription.trim(),
            priceCredits: numberOf(form.addonPriceCredits),
            isEnabled: form.addonEnabled,
            startsAt: form.addonStartsAt.trim() || null,
            endsAt: form.addonEndsAt.trim() || null,
          },
          ...preservedAddons.slice(1),
        ]
      : preservedAddons,
  };
}

function fieldStyle() {
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

function labelStyle() {
  return { color: '#aaa', fontSize: 11, fontWeight: '800' as const, marginTop: 10 };
}

function panelStyle(borderColor = '#222') {
  return {
    backgroundColor: '#111',
    borderColor,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function ToggleButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? '#1D9E75' : '#222',
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginRight: 7,
        marginBottom: 7,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{label}: {active ? 'On' : 'Off'}</Text>
    </Pressable>
  );
}

export function AdminPluginMarketplaceCommandPanel({ plugins, onPluginCreated, onPluginUpdated }: Props) {
  const [selectedPluginId, setSelectedPluginId] = useState(plugins[0]?.id || '');
  const [marketplaceForm, setMarketplaceForm] = useState<MarketplaceFormState>(() => formFromPlugin(plugins[0]));
  const [createForm, setCreateForm] = useState<CreatePluginFormState>({
    id: '',
    name: '',
    area: 'MISTRESS',
    description: '',
  });
  const [suggestions, setSuggestions] = useState<AdminPluginSuggestionList | null>(null);
  const [suggestionStatusFilter, setSuggestionStatusFilter] = useState<AdminPluginSuggestionStatus | 'all'>('new');
  const [suggestionKindFilter, setSuggestionKindFilter] = useState<'all' | 'plugin' | 'addon'>('all');
  const [suggestionRequestTypeFilter, setSuggestionRequestTypeFilter] = useState<AdminPluginSuggestionRequestType | 'all'>('all');
  const [suggestionRequesterFilter, setSuggestionRequesterFilter] = useState('');
  const [suggestionAssigneeFilter, setSuggestionAssigneeFilter] = useState('');
  const [suggestionDateFrom, setSuggestionDateFrom] = useState('');
  const [suggestionDateTo, setSuggestionDateTo] = useState('');
  const [includeFulfilledRequests, setIncludeFulfilledRequests] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlugin = useMemo(
    () => plugins.find((plugin) => plugin.id === selectedPluginId) || plugins[0] || null,
    [plugins, selectedPluginId],
  );
  const selectedMarketplace = useMemo(() => marketplaceOf(selectedPlugin), [selectedPlugin]);

  useEffect(() => {
    if (!plugins.length) {
      setSelectedPluginId('');
      return;
    }

    if (!selectedPluginId || !plugins.some((plugin) => plugin.id === selectedPluginId)) {
      setSelectedPluginId(plugins[0].id);
    }
  }, [plugins, selectedPluginId]);

  useEffect(() => {
    setMarketplaceForm(formFromPlugin(selectedPlugin));
  }, [selectedPlugin]);

  useEffect(() => {
    loadSuggestions();
  }, [suggestionStatusFilter, suggestionKindFilter, suggestionRequestTypeFilter, includeFulfilledRequests]);

  function updateMarketplaceField<K extends keyof MarketplaceFormState>(key: K, value: MarketplaceFormState[K]) {
    setMarketplaceForm((current) => ({ ...current, [key]: value }));
  }

  function updateCreateField<K extends keyof CreatePluginFormState>(key: K, value: CreatePluginFormState[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreatePlugin() {
    if (!createForm.name.trim()) {
      setError('Plugin name is required.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setMessage(null);
      const created = await createAdminPlugin({
        id: createForm.id.trim() || undefined,
        name: createForm.name.trim(),
        area: createForm.area.trim() || 'MISTRESS',
        status: 'SCAFFOLDED' as AdminPluginStatus,
        description: createForm.description.trim(),
        marketplaceSettings: buildMarketplaceSettings(marketplaceForm),
      });
      onPluginCreated(created);
      setSelectedPluginId(created.id);
      setCreateForm({ id: '', name: '', area: 'MISTRESS', description: '' });
      setMessage('Plugin created with marketplace controls.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugin creation failed');
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveMarketplaceSettings() {
    if (!selectedPlugin) {
      setError('Select a plugin before saving marketplace settings.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const updated = await updateAdminPluginMarketplaceSettings(
        selectedPlugin.id,
        buildMarketplaceSettings(marketplaceForm, selectedMarketplace),
      );
      onPluginUpdated(updated);
      setMessage('Plugin marketplace settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Marketplace settings failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function loadSuggestions() {
    try {
      setLoadingSuggestions(true);
      setError(null);
      const data = await listAdminPluginSuggestions({
        status: suggestionStatusFilter === 'all' ? undefined : suggestionStatusFilter,
        kind: suggestionKindFilter === 'all' ? undefined : suggestionKindFilter,
        requestType: suggestionRequestTypeFilter === 'all' ? undefined : suggestionRequestTypeFilter,
        submittedByUserId: suggestionRequesterFilter.trim() || undefined,
        assignedToUserId: suggestionAssigneeFilter.trim() || undefined,
        dateFrom: suggestionDateFrom.trim() || undefined,
        dateTo: suggestionDateTo.trim() || undefined,
        includeFulfilled: includeFulfilledRequests,
      });
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suggestion queue failed to load');
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleReviewSuggestion(suggestion: AdminPluginSuggestion, status: Exclude<AdminPluginSuggestionStatus, 'new'>) {
    const grantEntitlement = suggestion.requestType === 'purchase' && status === 'approved' && !suggestion.fulfillment;

    try {
      setError(null);
      setMessage(null);
      const result = await reviewAdminPluginSuggestion(suggestion.id, {
        status,
        note: reviewNotes[suggestion.id] || undefined,
        linkedPluginId: suggestion.pluginId || selectedPlugin?.id || undefined,
        grantEntitlement,
      });
      setReviewNotes((current) => ({ ...current, [suggestion.id]: '' }));
      setMessage(
        result.alreadyFulfilled
          ? 'Purchase was already fulfilled; no extra charge made.'
          : result.entitlementGranted
          ? result.purchaseCharged
            ? 'Purchase charged, approved, and plugin access granted.'
            : 'Purchase approved and plugin access granted.'
          : `Suggestion moved to ${status}.`,
      );
      await loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suggestion review failed');
    }
  }

  function renderChip<T extends string>(value: T, active: boolean, onPress: () => void, color = '#ff0055') {
    return (
      <Pressable
        key={value}
        onPress={onPress}
        style={{
          backgroundColor: active ? color : '#222',
          borderRadius: 999,
          paddingVertical: 8,
          paddingHorizontal: 10,
          marginRight: 7,
          marginBottom: 7,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{value.replace(/_/g, ' ')}</Text>
      </Pressable>
    );
  }

  function renderInput(label: string, value: string, onChangeText: (value: string) => void, numeric = false) {
    return (
      <View style={{ marginBottom: 4 }}>
        <Text style={labelStyle()}>{label}</Text>
        <TextInput value={value} onChangeText={onChangeText} keyboardType={numeric ? 'numeric' : 'default'} style={fieldStyle()} />
      </View>
    );
  }

  function renderSuggestionCard(suggestion: AdminPluginSuggestion) {
    const isPurchaseRequest = suggestion.requestType === 'purchase';
    const isFulfilled = Boolean(suggestion.fulfillment);

    return (
      <View key={suggestion.id} style={panelStyle(suggestion.status === 'new' ? '#d4af37' : '#222')}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{suggestion.title}</Text>
            <Text style={{ color: '#ff9abf', marginTop: 4 }}>
              {suggestion.requestType || 'suggestion'} / {suggestion.kind} / {suggestion.status} / {suggestion.budgetCredits ?? 0} credits
            </Text>
          </View>
          <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>
            {suggestion.pluginId || 'new plugin'}
          </Text>
        </View>
        {suggestion.purchase ? (
          <Text style={smallText('#d4af37')}>
            Purchase: {suggestion.purchase.optionName || suggestion.purchase.optionType} / {suggestion.purchase.priceCredits ?? 0} {suggestion.purchase.currency || 'credits'}
          </Text>
        ) : null}
        {isPurchaseRequest && !isFulfilled ? (
          <Text style={smallText('#1D9E75')}>
            Approving charges {suggestion.purchase?.priceCredits ?? 0} {suggestion.purchase?.currency || 'credits'} and grants access to {suggestion.submittedByUserId || 'the buyer'}.
          </Text>
        ) : null}
        {suggestion.fulfillment ? (
          <Text style={smallText('#1D9E75')}>
            Fulfilled: {suggestion.fulfillment.charged ? 'charged' : 'granted'} {suggestion.fulfillment.priceCredits ?? suggestion.purchase?.priceCredits ?? 0} {suggestion.fulfillment.currency || suggestion.purchase?.currency || 'credits'} / wallet {suggestion.fulfillment.walletTransactionId || 'none'} / entitlement {suggestion.fulfillment.entitlementId || 'unknown'}
          </Text>
        ) : null}
        <Text style={smallText()}>{suggestion.description || 'No description supplied.'}</Text>
        <Text style={smallText('#777')}>
          Category: {suggestion.requestedCategory || 'none'} / Contact: {suggestion.contactPreference || 'none'}
        </Text>
        <Text style={smallText('#777')}>
          Requester: {suggestion.submittedByUserId || 'unknown'} / Assigned: {suggestion.assignedToUserId || suggestion.latestReview?.assignedToUserId || 'unassigned'} / Submitted: {textOf(suggestion.submittedAt, 'unknown')}
        </Text>
        {suggestion.latestReview ? (
          <Text style={smallText('#1D9E75')}>
            Last review: {suggestion.latestReview.status} / {suggestion.latestReview.note || 'no note'} / assigned {suggestion.latestReview.assignedToUserId || 'none'}
          </Text>
        ) : null}
        <TextInput
          value={reviewNotes[suggestion.id] || ''}
          onChangeText={(value) => setReviewNotes((current) => ({ ...current, [suggestion.id]: value }))}
          placeholder="Admin review note"
          placeholderTextColor="#777"
          style={{ ...fieldStyle(), marginTop: 10 }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {REVIEW_ACTIONS.map((action) => {
            const approvalAlreadyGranted = isPurchaseRequest && isFulfilled && action.status === 'approved';
            return (
              <Pressable
                key={action.status}
                disabled={approvalAlreadyGranted}
                onPress={() => handleReviewSuggestion(suggestion, action.status)}
                style={{
                  backgroundColor: approvalAlreadyGranted ? '#333' : action.color,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  marginRight: 7,
                  marginBottom: 7,
                  opacity: approvalAlreadyGranted ? 0.7 : 1,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                  {approvalAlreadyGranted
                    ? 'Already Granted'
                    : isPurchaseRequest && action.status === 'approved'
                      ? 'Approve + Grant'
                      : action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>
        Plugin Marketplace Command
      </Text>
      {message ? <Text style={{ color: '#1D9E75', marginBottom: 8 }}>{message}</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</Text> : null}

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>Create plugin</Text>
        {renderInput('Name', createForm.name, (value) => updateCreateField('name', value))}
        {renderInput('Optional id', createForm.id, (value) => updateCreateField('id', value))}
        {renderInput('Area', createForm.area, (value) => updateCreateField('area', value.toUpperCase()))}
        {renderInput('Description', createForm.description, (value) => updateCreateField('description', value))}
        <Pressable
          onPress={handleCreatePlugin}
          disabled={creating}
          style={{
            backgroundColor: '#ff0055',
            opacity: creating ? 0.6 : 1,
            padding: 10,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>
            {creating ? 'Creating...' : 'Create Plugin'}
          </Text>
        </Pressable>
      </View>

      <View style={panelStyle('#333')}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 }}>Marketplace settings</Text>
        <Text style={labelStyle()}>Selected plugin</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {plugins.map((plugin) => renderChip(plugin.id, selectedPlugin?.id === plugin.id, () => setSelectedPluginId(plugin.id), '#d4af37'))}
        </View>
        {!selectedPlugin ? <Text style={smallText('#777')}>Create or load a plugin to edit marketplace settings.</Text> : null}

        <Text style={labelStyle()}>Monetization mode</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {MONETIZATION_MODES.map((mode) => renderChip(mode, marketplaceForm.monetizationMode === mode, () => updateMarketplaceField('monetizationMode', mode)))}
        </View>

        <Text style={labelStyle()}>License</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {LICENSE_TYPES.map((type) => renderChip(type, marketplaceForm.licenseType === type, () => updateMarketplaceField('licenseType', type), '#1D9E75'))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          <ToggleButton
            label="Marketplace"
            active={marketplaceForm.isMarketplaceVisible}
            onPress={() => updateMarketplaceField('isMarketplaceVisible', !marketplaceForm.isMarketplaceVisible)}
          />
          <ToggleButton
            label="Suggestions"
            active={marketplaceForm.suggestionBoxEnabled}
            onPress={() => updateMarketplaceField('suggestionBoxEnabled', !marketplaceForm.suggestionBoxEnabled)}
          />
          <ToggleButton
            label="Custom requests"
            active={marketplaceForm.customRequestEnabled}
            onPress={() => updateMarketplaceField('customRequestEnabled', !marketplaceForm.customRequestEnabled)}
          />
        </View>

        {renderInput('Currency', marketplaceForm.currency, (value) => updateMarketplaceField('currency', value))}
        {renderInput('Base price credits', marketplaceForm.basePriceCredits, (value) => updateMarketplaceField('basePriceCredits', value), true)}
        {renderInput('Fixed lifetime price credits', marketplaceForm.fixedLifetimePriceCredits, (value) => updateMarketplaceField('fixedLifetimePriceCredits', value), true)}
        {renderInput('Plugin limit', marketplaceForm.pluginLimit, (value) => updateMarketplaceField('pluginLimit', value), true)}
        {renderInput('Addon limit', marketplaceForm.addonLimit, (value) => updateMarketplaceField('addonLimit', value), true)}
        {renderInput('Starts at', marketplaceForm.startsAt, (value) => updateMarketplaceField('startsAt', value))}
        {renderInput('Ends at', marketplaceForm.endsAt, (value) => updateMarketplaceField('endsAt', value))}
        {renderInput('Timezone', marketplaceForm.timezone, (value) => updateMarketplaceField('timezone', value))}
        {renderInput('Pick 3 monthly price', marketplaceForm.starterBundlePrice, (value) => updateMarketplaceField('starterBundlePrice', value), true)}
        {renderInput('Pick 8 plus 20 addons monthly price', marketplaceForm.suiteBundlePrice, (value) => updateMarketplaceField('suiteBundlePrice', value), true)}
        <Text style={labelStyle()}>Addon controls</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          <ToggleButton
            label="Addon"
            active={marketplaceForm.addonEnabled}
            onPress={() => updateMarketplaceField('addonEnabled', !marketplaceForm.addonEnabled)}
          />
        </View>
        {renderInput('Addon name', marketplaceForm.addonName, (value) => updateMarketplaceField('addonName', value))}
        {renderInput('Addon price credits', marketplaceForm.addonPriceCredits, (value) => updateMarketplaceField('addonPriceCredits', value), true)}
        {renderInput('Addon starts at', marketplaceForm.addonStartsAt, (value) => updateMarketplaceField('addonStartsAt', value))}
        {renderInput('Addon ends at', marketplaceForm.addonEndsAt, (value) => updateMarketplaceField('addonEndsAt', value))}
        {renderInput('Addon description', marketplaceForm.addonDescription, (value) => updateMarketplaceField('addonDescription', value))}

        <Pressable
          onPress={handleSaveMarketplaceSettings}
          disabled={saving || !selectedPlugin}
          style={{
            backgroundColor: '#ff0055',
            opacity: saving || !selectedPlugin ? 0.6 : 1,
            padding: 10,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>
            {saving ? 'Saving...' : 'Save Marketplace Settings'}
          </Text>
        </Pressable>
      </View>

      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 8 }}>Suggestion queue</Text>
        <Text style={smallText('#777')}>
          Total: {suggestions?.summary.total ?? 0} / Purchases: {suggestions?.summary.purchaseRequests ?? 0} / Suggestions: {suggestions?.summary.suggestions ?? 0} / Unfulfilled: {suggestions?.summary.unfulfilled ?? 0}
        </Text>
        <Text style={labelStyle()}>Status</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {SUGGESTION_FILTERS.map((status) => renderChip(status, suggestionStatusFilter === status, () => setSuggestionStatusFilter(status), '#d4af37'))}
        </View>
        <Text style={labelStyle()}>Kind</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {(['all', 'plugin', 'addon'] as const).map((kind) => renderChip(kind, suggestionKindFilter === kind, () => setSuggestionKindFilter(kind), '#1D9E75'))}
        </View>
        <Text style={labelStyle()}>Request type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {REQUEST_TYPE_FILTERS.map((requestType) => renderChip(
            requestType,
            suggestionRequestTypeFilter === requestType,
            () => setSuggestionRequestTypeFilter(requestType),
            '#ff9abf',
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          <ToggleButton
            label="Fulfilled"
            active={includeFulfilledRequests}
            onPress={() => setIncludeFulfilledRequests(!includeFulfilledRequests)}
          />
        </View>
        {renderInput('Requester user id', suggestionRequesterFilter, setSuggestionRequesterFilter)}
        {renderInput('Assigned user id', suggestionAssigneeFilter, setSuggestionAssigneeFilter)}
        {renderInput('Submitted from', suggestionDateFrom, setSuggestionDateFrom)}
        {renderInput('Submitted to', suggestionDateTo, setSuggestionDateTo)}
        <Pressable onPress={loadSuggestions} style={{ backgroundColor: '#222', padding: 10, borderRadius: 10, marginBottom: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>
            {loadingSuggestions ? 'Loading...' : 'Refresh Suggestions'}
          </Text>
        </Pressable>

        {(suggestions?.items || []).map(renderSuggestionCard)}
        {!loadingSuggestions && suggestions?.items.length === 0 ? (
          <Text style={smallText('#777')}>No plugin or addon suggestions match these filters.</Text>
        ) : null}
      </View>
    </View>
  );
}
