# Packaging & Installer Generation

This document explains how to create installers/packages for the Async Task Scheduler and how the CI workflow produces artifacts.

## CI Packaging (GitHub Actions)

A workflow is provided at `.github/workflows/packaging.yml`. It runs on tagged pushes (v* tags) and on manual dispatch. For each platform (Windows, macOS, Linux) it:

- builds the C++ project with CMake
- builds the UI (`ui/client`)
- runs platform packaging scripts to produce artifacts
- uploads artifacts to the workflow run

Windows builds use NSIS (if available) to create an `.exe` installer. The NSIS script template is at `packaging/windows/installer.nsi` and a helper script `packaging/windows/package.ps1` produces the staging directory and invokes `makensis`.

On macOS and Linux the CI creates a compressed tarball of the `build` outputs and `ui/client/build` in `dist/`.

## Local Packaging

### Windows (NSIS)

Requirements:
- NSIS (makensis) on PATH

From repository root:

```powershell
# Run packaging script (PowerShell)
.\packaging\windows\package.ps1 -BuildDir build -UiDir ui -OutDir dist
```

If `makensis` is not installed, the script will generate `installer_generated.nsi` in the `dist` folder; install NSIS and run `makensis` manually.

### macOS / Linux

```bash
chmod +x packaging/package.sh
./packaging/package.sh build ui dist
```

This produces a `dist/*.tar.gz` file containing the scheduler binaries and the static UI build.

## Customization

- Edit `packaging/windows/installer.nsi` to change install paths, shortcuts, or add registry entries.
- Update `packaging/windows/package.ps1` to include additional files in the staging directory.
- Add code signing steps to the CI workflow when you have a signing certificate (recommended for Windows installers).

## CI Integration Notes

- The workflow uses the `actions/upload-artifact` step to persist build artifacts.
- To produce a signed installer on CI, add signing actions/steps in the `packaging` job for the appropriate platform.

## Next Steps (Optional)

- Add an MSI build (WiX) for enterprise installs.
- Add code-signing to the CI pipeline.
- Add platform-specific packages (deb, rpm, dmg, msi) as needed.
