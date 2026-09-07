# Orbiter High Resolution Camera (OHRC)

**Sensor**: Orbiter High Resolution Camera (OHRC)
**Mission**: Chandrayaan-2 (ISRO)
**Type**: Optical High-Resolution Panchromatic Imager
**Instrument Lead**: Space Applications Centre (SAC), ISRO

## Technical Specifications
- **Spatial Ground Resolution**: 0.25 m to 0.32 m per pixel from a 100 km nominal circular polar orbit.
- **Spectral Band**: Panchromatic optical range (450 nm to 900 nm).
- **Swath Width**: Approximately 12 km ground swath at 100 km altitude (imaging mode dependent: ~3 km to 12 km).
- **Detector Type**: TDI (Time Delay and Integration) CCD array detector.
- **Pointing & Agility**: Steerable mirror mechanism capable of roll tilting (cross-track pointing up to ±25°) to acquire repeat passes or stereo pairs of target sites.
- **Quantization**: 10-bit or 12-bit radiometric digitization.

## Primary Purpose & Capabilities
OHRC provides the sharpest, highest-resolution optical imagery ever flown to the Moon in a civilian scientific orbiter:
1. **Landing Site Characterization**: High-fidelity detection of sub-meter surface hazards, rocks, micro-craters, slopes, and boulders for robotic lander safety.
2. **Morphological Studies**: Detailed visual inspection of impact crater rims, central peaks, ejecta blankets, volcanic rilles, and tectonic grabens.
3. **Multi-Scale Image Matching**: Serves as the ultra-fine resolution reference layer in multi-sensor alignment when paired with lower-resolution datasets like TMC-2 and IIRS.

## Illumination & Sun Angle Dynamics
- OHRC frequently acquires imagery at low solar elevation angles (grazing sun angles) to enhance subtle surface relief and shadow contrasts.
- Because shadows shift dramatically depending on the solar azimuth and elevation at the time of overpass, automatic correspondence matching between multi-temporal OHRC frames or cross-sensor pairs requires illumination- and Sun-angle invariant feature descriptors.
