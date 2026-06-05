# Collectibles Feature Folder

This folder contains collectible sticker and album plugin screens for Mistress-X.

## Screens

```text
sticker-collector-system-placeholder.js
nft-owner-vault/
nft-profile-cabinet/
```

`nft-owner-vault/` is the cross-role collector vault screen for owned MX NFT and
platform collectible assets.

`nft-profile-cabinet/` is the cross-role cabinet screen for choosing which owned
NFT or collectible assets appear on profile surfaces.

## Current frontend status

```text
Sticker Collector System screen      ██████████ 100%
Sticker type placeholders             ██████████ 100%
Album lifecycle placeholders          ██████████ 100%
Matching item sticker rule            ██████████ 100%
Image editor/upload wiring            ░░░░░░░░░░ pending
Sticker ownership database            ░░░░░░░░░░ pending
Wallet/chat/store integration         ░░░░░░░░░░ pending
```

## Captured sticker types

```text
Photo Cutout Sticker
Matching Item Sticker
Monthly Drop Sticker
Award Sticker
Paid Custom Sticker
Album Completion Sticker
```

## Backend still needed

```text
Sticker upload service
Cutout/white-border editor service
Sticker ownership service
Sticker send/purchase service
Album progress service
Monthly drop scheduler
Matching item sticker hook from inventory orders
Moderation/reporting hooks
```

## Database still needed

```text
stickers
sticker_assets
sticker_albums
sticker_album_items
sticker_ownerships
sticker_sends
sticker_purchases
sticker_drops
sticker_completion_rewards
```
