import { useState } from 'react';

export default function StickerGeneratorPanel() {
  const [preview, setPreview] = useState(null);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <section className="mx-sticker-generator">
      <header>
        <p className="mx-eyebrow">Sticker Generator</p>
        <h2>Create Collectible</h2>
      </header>

      <input type="file" onChange={handleUpload} />

      {preview && (
        <div className="mx-sticker-preview">
          <img src={preview} alt="sticker preview" />
          <p>Auto-cut + white border (future backend processing)</p>
        </div>
      )}
    </section>
  );
}
