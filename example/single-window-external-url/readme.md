# single-window-external-url

* Read from onther language: [English](README.md), [繁體中文](README-zh-TW.md)

This Project is designed for beginners who are trying to use electron

goals:
- briefly understand what is electron
- basic electron config
- using signle window
- using external web app(url is configured in `config.js`)
- package 

## Table Of Content

- [single-window-external-url](#single-window-external-url)
  - [Table Of Content](#table-of-content)
  - [Implementation](#implementation)
    - [Project Structure](#project-structure)
    - [Basic Concept](#basic-concept)
      - [Display website](#display-website)
    - [MacOs User Experience](#macos-user-experience)
  - [Packaging Production App](#packaging-production-app)
    - [Background](#background)
    - [Parameters](#parameters)
      - [Shared Parameter](#shared-parameter)
      - [MacOS Parameter](#macos-parameter)
      - [Windows Parameter](#windows-parameter)
    - [Example](#example)
      - [Package MacOs App](#package-macos-app)
      - [Package Linux App](#package-linux-app)
      - [Package Windows App](#package-windows-app)
  - [Related Readings](#related-readings)

## Implementation

The usage of `electron` is on compile time, not run time. Therefore, `electron` is used as devDependencies, which also help to reduce the size of packaged app.

```bash
npm install --save-dev electron@17.1.2
```

### Project Structure

```
electron
├── build
├── config.js
├── lib
│   └── pre-load.js
├── main.js
├── package-lock.json
├── package.json
├── readme-zh-TW.md
└── readme.md
```

### Basic Concept

In this projec, we are using  `app` and `BrowserWindow` class from electron.

1. app is relating to the application main thread, controling BrowserWindow.

2. BrowserWindow is relating to the browser window.

#### Display website

In side `createWindow()`, we simplily use `loadURL()` to load a external url.

```javascript
win.loadURL(config.url);
```


### MacOs User Experience

The user experience of opening and closing window is different from Mac and linux/window.

1. Close
   - Short Key: `cmd + w`
   - when user close a window, it's icon is still shown on dock and it is still running on background
   - related to electon BrowserWindow event: `close`

    Therefore, we shuold add handling for MacOs on  `re-open` & `close`:

    1.1: When all windows are closed, check to OS. If it is not MacOs (darwin), then fire `quit`.
    ```js
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') 
            app.quit();
    });
    ```

    1.2: when application is executed(`ready`), create windoe. Also listen to `activate` event. If application is `close` but no running window, then re-oprn the window.
    ```js
    app.on('ready', () => {
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
    ```


2. Quit / Terminate
   - Short Key: `cmd + q`
   - relating to electon BrowserWindow event: `quit`
    
    This use action does not reqyure extra handling, `quit` event is default handled like other platforms.

Protential LifeCycle:

> Open -> close (cmd + w) -> quit (cmd + q)

> Open -> close (cmd + w) -> activate -> quit (cmd + q)

## Packaging Production App

### Background

Supported Platform(OS):
- Windows (32/64 bit)
- macOS (formerly known as OS X)
- Linux (x86/x86_64)

System requirement:
- Node.js 10.0

Installation:
```bash
npm install --g electron-packager
```

### Parameters

#### Shared Parameter

Parm | Data type | Description
--- | --- | --- 
dir | string | source directory | 
afterCopy | HookFunction[] | Functions to be called after your app directory has been copied to a temporary directory
afterExtract | HookFunction[] | Functions to be called after the prebuilt Electron binary has been extracted to a temporary directory
afterPrune | HookFunction[] | Functions to be called after Node module pruning has been applied to the application
all | boolean | When `true`, sets both [[arch]] and [[platform]] to `all`
appCopyright | string | The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata property on Windows, and `NSHumanReadableCopyright` on macOS.
appVersion | string | The release version of the application. By default the `version` property in the `package.json` is used.
arch | ArchOption | The target system architecture(s) to build for. `ia32`, `x64`, `armv7l`, `arm64`(Linux), `mips64el`
asar | boolean | Whether to package the application's source code into an archive
buildVersion | string | The build version of the application. Defaults to the value of the [[appVersion]] option.
derefSymlinks | boolean | Whether symlinks should be dereferenced during the copying of the application source.
executableName | string | The name of the executable file, sans file extension. Defaults to the value for the [[name]] option
icon | string | The local path to the icon file, if the target platform supports setting embedding an icon. macOS: `.icns` , Windows: `.ico`
name | string | The application name. If omitted, it will use the `productName` or `name` value from the nearest `package.json`.
out | string | The base directory where the finished package(s) are created. Defaults to the current working directory.
overwrite | boolean | Whether to replace an already existing output directory for a given platform (`true`) or skip recreating it (`false`). Defaults to `false`.
platform | PlatformOption | The target platform(s) to build for: `darwin` (macOS), `linux`, `mas` (macOS, specifically for submitting to the Mac App Store), `win32`
prune | boolean | Walks the `node_modules` dependency tree to remove all of the packages specified in the `devDependencies` section of `package.json` from the outputted Electron app.

#### MacOS Parameter

Parm | Data type | Description
--- | --- | --- 
appBundleId | string | The bundle identifier to use in the application's `Info.plist` 
appCategoryType | string | The application category type, as shown in the Finder via  View → Arrange by Application
darwinDarkModeSupport | boolean | Forces support for Mojave (macOS 10.14) dark mode in your packaged app. This sets the `NSRequiresAquaSystemAppearance` key to `false` in your app's `Info.plist`.
extendInfo | string or { [property: string]: any } | When the value is a string, specifies the filename of a `plist` file. Its contents are merged into the app's `Info.plist`. When the value is an `Object`, it specifies an already-parsed `plist` data structure that is merged into the app's `Info.plist`.
extendHelperInfo | string or { [property: string]: any } | When the value is a string, specifies the filename of a `plist` file. Its contents are merged into all the Helper apps' `Info.plist` files. When the value is an `Object`, it specifies an already-parsed `plist` data structure that is merged into all the Helper apps' `Info.plist` files.

#### Windows Parameter

Parm | Data type | Description
--- | --- | --- 
win32metadata | Win32MetadataOptions | Application metadata to embed into the Windows executable.

### Example

#### Package MacOs App

```bash
electron-packager . app-mac --app-version=0.0.1 --platform=darwin --arch=x64 --asar --prune --out=./build
```

#### Package Linux App

```bash
electron-packager . app-linux --app-version=0.0.1 --platform=linux --arch=x64 --asar --prune --out=./build
```

#### Package Windows App

```bash
electron-packager . app-linux --app-version=0.0.1 --platform=win32 --arch=ia32 --asar --prune --out=./build
```

## Related Readings

[Electron Official Website](https://www.electronjs.org/)

[Electron Tutor](https://github.com/electron/electron-quick-start)

[Electron packager Github](https://github.com/electron/electron-packager)

[BrowserWindow Setting](https://www.electronjs.org/docs/latest/api/browser-window)