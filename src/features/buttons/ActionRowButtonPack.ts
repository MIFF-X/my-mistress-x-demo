export type ActionRowButtonKey =
  | 'activateGoal'
  | 'addStock'
  | 'cancelAction'
  | 'completePayment'
  | 'createListing'
  | 'editAction'
  | 'loadCompetition'
  | 'recalculatePositions'
  | 'refreshListings'
  | 'saveAction'
  | 'updateFulfilment'
  | 'archiveGoal'
  | 'approveMarketplace'
  | 'bagHolder'
  | 'banUser'
  | 'blockUser'
  | 'buyNow'
  | 'contribute'
  | 'copyCsv'
  | 'createDraft'
  | 'crownHolder'
  | 'declineMarketplace'
  | 'downloadCsv'
  | 'extinguishUser'
  | 'fulfillOrder'
  | 'hideExport'
  | 'loadHistory'
  | 'makeInvisible'
  | 'pauseGoal'
  | 'receipts'
  | 'requestApproval'
  | 'sendGift'
  | 'shareCsv'
  | 'shoeHolder'
  | 'showExport'
  | 'tracking'
  | 'wishlistBuy'
  | 'wishlistReserve';

export type ActionRowButtonSpec = {
  key: ActionRowButtonKey;
  label: string;
  fallbackGlyph: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  pngAssetPath: string;
};

const actionRowButtonPack: Record<ActionRowButtonKey, ActionRowButtonSpec> = {
  addStock: {
    key: 'addStock',
    label: 'Add Stock',
    fallbackGlyph: 'ST',
    backgroundColor: '#1b1b1b',
    textColor: '#ffffff',
    borderColor: '#555555',
    pngAssetPath: 'frontend/assets/action-row-buttons/add-stock.png',
  },
  cancelAction: {
    key: 'cancelAction',
    label: 'Cancel',
    fallbackGlyph: 'CA',
    backgroundColor: '#26101a',
    textColor: '#ff9abf',
    borderColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-row-buttons/cancel-action.png',
  },
  completePayment: {
    key: 'completePayment',
    label: 'Complete Payment',
    fallbackGlyph: 'CP',
    backgroundColor: '#1D9E75',
    textColor: '#ffffff',
    borderColor: '#30d29f',
    pngAssetPath: 'frontend/assets/action-row-buttons/complete-payment.png',
  },
  createListing: {
    key: 'createListing',
    label: 'Create Listing',
    fallbackGlyph: 'CL',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/create-listing.png',
  },
  editAction: {
    key: 'editAction',
    label: 'Edit',
    fallbackGlyph: 'ED',
    backgroundColor: '#2b2208',
    textColor: '#d4af37',
    borderColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-row-buttons/edit-action.png',
  },
  loadCompetition: {
    key: 'loadCompetition',
    label: 'Load',
    fallbackGlyph: 'LD',
    backgroundColor: '#222222',
    textColor: '#ffffff',
    borderColor: '#444444',
    pngAssetPath: 'frontend/assets/action-row-buttons/load-competition.png',
  },
  recalculatePositions: {
    key: 'recalculatePositions',
    label: 'Recalculate Positions',
    fallbackGlyph: 'RP',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/recalculate-positions.png',
  },
  refreshListings: {
    key: 'refreshListings',
    label: 'Refresh',
    fallbackGlyph: 'RF',
    backgroundColor: '#1b1b1b',
    textColor: '#ffffff',
    borderColor: '#555555',
    pngAssetPath: 'frontend/assets/action-row-buttons/refresh-listings.png',
  },
  saveAction: {
    key: 'saveAction',
    label: 'Save',
    fallbackGlyph: 'SV',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/save-action.png',
  },
  updateFulfilment: {
    key: 'updateFulfilment',
    label: 'Update Fulfilment',
    fallbackGlyph: 'UF',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/update-fulfilment.png',
  },
  activateGoal: {
    key: 'activateGoal',
    label: 'Activate',
    fallbackGlyph: 'ON',
    backgroundColor: '#1D9E75',
    textColor: '#ffffff',
    borderColor: '#30d29f',
    pngAssetPath: 'frontend/assets/action-row-buttons/activate-goal.png',
  },
  archiveGoal: {
    key: 'archiveGoal',
    label: 'Archive',
    fallbackGlyph: 'AR',
    backgroundColor: '#441122',
    textColor: '#ffffff',
    borderColor: '#7f1d3c',
    pngAssetPath: 'frontend/assets/action-row-buttons/archive-goal.png',
  },
  approveMarketplace: {
    key: 'approveMarketplace',
    label: 'Approve',
    fallbackGlyph: 'OK',
    backgroundColor: '#1D9E75',
    textColor: '#ffffff',
    borderColor: '#30d29f',
    pngAssetPath: 'frontend/assets/action-row-buttons/approve-marketplace.png',
  },
  bagHolder: {
    key: 'bagHolder',
    label: 'Bag Holder',
    fallbackGlyph: 'BH',
    backgroundColor: '#241018',
    textColor: '#f9a8d4',
    borderColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-row-buttons/bag-holder.png',
  },
  banUser: {
    key: 'banUser',
    label: 'Ban',
    fallbackGlyph: 'BN',
    backgroundColor: '#3f1018',
    textColor: '#ffffff',
    borderColor: '#ef4444',
    pngAssetPath: 'frontend/assets/action-row-buttons/ban-user.png',
  },
  blockUser: {
    key: 'blockUser',
    label: 'Block',
    fallbackGlyph: 'BK',
    backgroundColor: '#2a1a1f',
    textColor: '#fecdd3',
    borderColor: '#fb7185',
    pngAssetPath: 'frontend/assets/action-row-buttons/block-user.png',
  },
  buyNow: {
    key: 'buyNow',
    label: 'Buy Now',
    fallbackGlyph: 'BY',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/buy-now.png',
  },
  contribute: {
    key: 'contribute',
    label: 'Contribute',
    fallbackGlyph: 'CT',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/contribute.png',
  },
  copyCsv: {
    key: 'copyCsv',
    label: 'Copy CSV',
    fallbackGlyph: 'CP',
    backgroundColor: '#333333',
    textColor: '#ffffff',
    borderColor: '#555555',
    pngAssetPath: 'frontend/assets/action-row-buttons/copy-csv.png',
  },
  createDraft: {
    key: 'createDraft',
    label: 'Create Draft Fund',
    fallbackGlyph: 'DF',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/create-draft-fund.png',
  },
  crownHolder: {
    key: 'crownHolder',
    label: 'Crown Holder',
    fallbackGlyph: 'CR',
    backgroundColor: '#2a210a',
    textColor: '#fde68a',
    borderColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-row-buttons/crown-holder.png',
  },
  declineMarketplace: {
    key: 'declineMarketplace',
    label: 'Decline',
    fallbackGlyph: 'NO',
    backgroundColor: '#3f1018',
    textColor: '#ffffff',
    borderColor: '#ef4444',
    pngAssetPath: 'frontend/assets/action-row-buttons/decline-marketplace.png',
  },
  downloadCsv: {
    key: 'downloadCsv',
    label: 'Download CSV',
    fallbackGlyph: 'DL',
    backgroundColor: '#2dd4bf',
    textColor: '#001311',
    borderColor: '#99f6e4',
    pngAssetPath: 'frontend/assets/action-row-buttons/download-csv.png',
  },
  extinguishUser: {
    key: 'extinguishUser',
    label: 'Extinguish',
    fallbackGlyph: 'EX',
    backgroundColor: '#19070c',
    textColor: '#ffffff',
    borderColor: '#ff0055',
    pngAssetPath: 'frontend/assets/action-row-buttons/extinguish-user.png',
  },
  fulfillOrder: {
    key: 'fulfillOrder',
    label: 'Fulfil Order',
    fallbackGlyph: 'FL',
    backgroundColor: '#1D9E75',
    textColor: '#ffffff',
    borderColor: '#30d29f',
    pngAssetPath: 'frontend/assets/action-row-buttons/fulfil-order.png',
  },
  hideExport: {
    key: 'hideExport',
    label: 'Hide Export',
    fallbackGlyph: 'HD',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/hide-export.png',
  },
  loadHistory: {
    key: 'loadHistory',
    label: 'Load History',
    fallbackGlyph: 'LH',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/load-history.png',
  },
  makeInvisible: {
    key: 'makeInvisible',
    label: 'Invisible',
    fallbackGlyph: 'IN',
    backgroundColor: '#111827',
    textColor: '#bfdbfe',
    borderColor: '#60a5fa',
    pngAssetPath: 'frontend/assets/action-row-buttons/make-invisible.png',
  },
  pauseGoal: {
    key: 'pauseGoal',
    label: 'Pause',
    fallbackGlyph: 'PA',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/pause-goal.png',
  },
  receipts: {
    key: 'receipts',
    label: 'Receipts',
    fallbackGlyph: 'RC',
    backgroundColor: '#222222',
    textColor: '#ffffff',
    borderColor: '#444444',
    pngAssetPath: 'frontend/assets/action-row-buttons/receipts.png',
  },
  requestApproval: {
    key: 'requestApproval',
    label: 'Request Approval',
    fallbackGlyph: 'RQ',
    backgroundColor: '#241018',
    textColor: '#f9a8d4',
    borderColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-row-buttons/request-approval.png',
  },
  sendGift: {
    key: 'sendGift',
    label: 'Send Gift',
    fallbackGlyph: 'GF',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/send-gift.png',
  },
  shareCsv: {
    key: 'shareCsv',
    label: 'Share CSV',
    fallbackGlyph: 'SH',
    backgroundColor: '#f472b6',
    textColor: '#16000a',
    borderColor: '#f9a8d4',
    pngAssetPath: 'frontend/assets/action-row-buttons/share-csv.png',
  },
  shoeHolder: {
    key: 'shoeHolder',
    label: 'Shoe Holder',
    fallbackGlyph: 'SH',
    backgroundColor: '#2a210a',
    textColor: '#fde68a',
    borderColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-row-buttons/shoe-holder.png',
  },
  showExport: {
    key: 'showExport',
    label: 'Show Export',
    fallbackGlyph: 'SX',
    backgroundColor: '#d4af37',
    textColor: '#000000',
    borderColor: '#fde68a',
    pngAssetPath: 'frontend/assets/action-row-buttons/show-export.png',
  },
  tracking: {
    key: 'tracking',
    label: 'Tracking',
    fallbackGlyph: 'TR',
    backgroundColor: '#222222',
    textColor: '#ffffff',
    borderColor: '#555555',
    pngAssetPath: 'frontend/assets/action-row-buttons/tracking.png',
  },
  wishlistBuy: {
    key: 'wishlistBuy',
    label: 'Buy Wishlist Item',
    fallbackGlyph: 'WB',
    backgroundColor: '#ff0055',
    textColor: '#ffffff',
    borderColor: '#ff7aa6',
    pngAssetPath: 'frontend/assets/action-row-buttons/wishlist-buy.png',
  },
  wishlistReserve: {
    key: 'wishlistReserve',
    label: 'Reserve Wishlist Item',
    fallbackGlyph: 'WR',
    backgroundColor: '#241018',
    textColor: '#f9a8d4',
    borderColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-row-buttons/wishlist-reserve.png',
  },
};

export function getActionRowButtonSpec(key: ActionRowButtonKey) {
  return actionRowButtonPack[key];
}

export function getActionRowButtonPack() {
  return Object.values(actionRowButtonPack);
}
