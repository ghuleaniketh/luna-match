# Terrain Mapping Camera-2 (TMC-2)

**Sensor**: Terrain Mapping Camera-2 (TMC-2)
**Mission**: Chandrayaan-2 (ISRO)
**Type**: Triplet Stereoscopic Panchromatic Imager
**Instrument Lead**: Space Applications Centre (SAC), ISRO

## Technical Specifications
- **Spatial Ground Resolution**: 5 meters per pixel (at 100 km orbit).
- **Spectral Band**: Panchromatic optical range (500 nm to 850 nm).
- **Swath Width**: 20 km cross-track ground coverage at 100 km orbital altitude.
- **Viewing Geometry (Triplet Stereo)**:
  - **Fore View**: Look angle of +26° along-track.
  - **Nadir View**: Look angle of 0° directly downward.
  - **Aft View**: Look angle of -26° along-track.
- **Base-to-Height (B/H) Ratio**: ~1.0, optimal for stereoscopic photogrammetry and height reconstruction.
- **Quantization**: 10-bit or 12-bit linear data.

## Primary Purpose & Capabilities
1. **3D Topographic Mapping**: TMC-2 generates seamless 3D stereo imagery along the spacecraft track. Using photogrammetric bundle adjustment and stereo matching between Fore, Nadir, and Aft frames, high-precision Digital Elevation Models (DEMs) and Digital Terrain Models (DTMs) are computed.
2. **Volumetric & Geomorphic Analysis**: Quantifies crater depth-to-diameter ratios, volcanic flow thicknesses, central peak elevations, and surface slopes.
3. **Regional Geodetic Reference**: Provides wide-swath (20 km) contextual elevation and geometric baselines that bridge local ultra-high-resolution OHRC patches with global lunar control networks.

## Differences Between TMC-2 and OHRC
- **Spatial Scale**: TMC-2 has a 5.0 m/pixel resolution vs. OHRC's ultra-high 0.25–0.32 m/pixel resolution (a ~16x to 20x scale difference).
- **Coverage**: TMC-2 acquires continuous 20 km-wide strips with instantaneous 3-view stereo triplets, whereas OHRC focuses on targeted sub-meter swaths (~12 km).
- **Function**: TMC-2 provides regional 3D topography and stereo relief, whereas OHRC focuses on landing hazards and micro-scale morphology.
