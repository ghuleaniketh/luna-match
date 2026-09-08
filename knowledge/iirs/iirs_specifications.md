# Imaging Infrared Spectrometer (IIRS)

**Sensor**: Imaging Infrared Spectrometer (IIRS)
**Mission**: Chandrayaan-2 (ISRO)
**Type**: Hyperspectral Imaging Spectrometer (Near-Infrared to Mid-Infrared)
**Instrument Lead**: Space Applications Centre (SAC), ISRO

## Technical Specifications
- **Spectral Coverage**: 0.8 µm to 5.0 µm (800 nm to 5000 nm contiguous spectrum).
- **Spectral Bands**: ~256 contiguous spectral channels.
- **Spectral Sampling / Resolution**: ~15 nm to 20 nm per spectral channel.
- **Spatial Ground Resolution**: ~80 m per pixel from nominal 100 km circular polar orbit.
- **Swath Width**: 20 km ground swath.
- **Detector Array**: Actively cooled Mercury-Cadmium-Telluride (MCT) focal plane array (operating at cryogenic temperatures ~80 K to 90 K using an onboard Stirling cryo-cooler).
- **Signal-to-Noise Ratio (SNR)**: High SNR (> 500 in NIR, > 200 in SWIR/MWIR) designed to capture subtle mineral absorption features.

## Primary Purpose & Capabilities
1. **Hydration & Hydroxyl Detection**: Extends past 3.0 µm into the critical 2.8 µm – 3.2 µm infrared regime to unambiguously discriminate between adsorbed molecular water (H2O) and structural hydroxyl (OH) ions on the lunar surface and in shadowed polar deposits.
2. **Mineralogical Mapping**: Identifies diagnostic electronic and vibrational absorption bands of major lunar silicate minerals:
   - **Pyroxene**: Characteristic absorption doublets near 1.0 µm and 2.0 µm (clinopyroxene vs orthopyroxene).
   - **Olivine**: Broad composite absorption feature centered near 1.05 µm.
   - **Plagioclase (Anorthosite)**: Minor Fe2+ absorption near 1.25 µm.
   - **Spinel & Ilmenite**: Distinct UV-VIS-NIR spectral slopes and absorption characteristics.
3. **Thermal Emission Extraction**: Beyond 3.0 µm, separates surface thermal emission from reflected solar radiance to estimate surface temperature variations and accurate reflectance spectra.

## Challenges in Cross-Sensor Registration with IIRS
- **Resolution Mismatch**: 80 m/pixel for IIRS vs. 5 m/pixel for TMC-2 (16x difference) and 0.3 m/pixel for OHRC (>250x difference).
- **Modal Differences**: Hyperspectral radiance bands show physical compositional absorption and thermal emissivity, while optical images (OHRC/TMC-2) capture panchromatic surface reflectance and shadow geometry. Cross-modal correspondence requires multi-scale structural matching.
