<p align="center"><img src="img/red.png"></p>

| <img src="img/poke.svg" height="16"> [![License: MIT](https://img.shields.io/badge/License-MIT-grey.svg)](https://opensource.org/licenses/MIT) |
| :- |

# Power Apps Component Framework Authentication

[App package size workaround](https://github.com/MicrosoftDocs/powerapps-docs/issues/1129#event-3115417141)

Run with `msbuild /t:restore` on Visual Studio cmd line. [Import the into the CDS SQL Database](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/use-sample-components) from the UI or using a script. Located in `bin\debug`.

Uses [Office UI Fabric](https://developer.microsoft.com/en-us/fabric#/get-started) styles and controls.
Uses [OpenId Client Settings](https://github.com/IdentityModel/oidc-client-js/wiki#other-optional-settings).

Authenticate using `pac auth`. In the component folder at the package.json level.
```
pac solution init --publisher-name Greg --publisher-prefix grdegr
pac solution add-reference --path .\AuthenticationComponent
msbuild /t:restore
msbuild
```

Push Component to CDS.
```
pac pcf push -pp grdegr -v minimal
```

Creates a `prefix_Namespace.ComponentName` control if changes are made to any of it's resource. The WebResource containing all of these PCF resources are located in `prefix_Namespace.ComponentName/bundle.js`.

If you face this `Error: WebResource content size is too big.` can use temporarily use [this hack](https://parthimscrm.wordpress.com/2016/05/10/webresource-content-size-is-too-big-microsoft-dynamics-crm-error-code-0x8004f114/) that involves increasing the size limit of email attachments from the 5120 KB to something larger.

[Connect pac to CDS](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/import-custom-controls#connecting-to-your-environment)



1. Make sure global action step is activated
2. Make sure global action step is registered in Plug-in registration tool
3. deploy.bat 
4. 