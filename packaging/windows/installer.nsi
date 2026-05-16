; NSIS installer template for Async Task Scheduler
; Generated or used by packaging/windows/package.ps1

!include MUI2.nsh

!define PRODUCT_NAME "${PRODUCT_NAME}"
!define PRODUCT_VERSION "1.0.0"
!define COMPANY_NAME "OpenSource"

Name "${PRODUCT_NAME}"
OutFile "${INSTALLER_NAME}"
InstallDir "$PROGRAMFILES\\${PRODUCT_NAME}"
RequestExecutionLevel admin

Page directory
Page instfiles

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "*"
  ; Create shortcuts
  CreateShortCut "$DESKTOP\\${PRODUCT_NAME}.lnk" "$INSTDIR\\scheduler_test.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\\scheduler_test.exe"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\\${PRODUCT_NAME}.lnk"
SectionEnd
