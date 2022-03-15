# single-window-external-url

* 更多文檔語言: [English](README.md), [繁體中文](README-zh-TW.md)

這是一個嘗試應用electron程式的初學者項目. 

項目目標如下:
- 初步理解electron
- 基本electron配置
- 單視窗
- HTML page (在`config.js`配置)
- 成功封裝

## 目錄

- [single-window-external-url](#single-window-external-url)
  - [目錄](#目錄)
  - [開發](#開發)
    - [程式結構](#程式結構)
    - [基礎](#基礎)
      - [展示網站](#展示網站)
    - [MacOs環境的用戶體驗](#macos環境的用戶體驗)
  - [封裝生產環境程式](#封裝生產環境程式)
    - [背景](#背景)
    - [參數](#參數)
      - [共用參數](#共用參數)
      - [MacOS 參數](#macos-參數)
      - [Windows 參數](#windows-參數)
    - [例子](#例子)
      - [封裝MacOs程式](#封裝macos程式)
      - [封裝Linux程式](#封裝linux程式)
      - [封裝Windows程式](#封裝windows程式)
  - [相關閱讀](#相關閱讀)

## 開發

`electron` 的使用是在程式的編譯, 而不在執行. 所以`electron`應儲存為 devDependencies, 可以減少封裝後程式的大小.

```bash
npm install --save-dev electron@17.1.2
```

### 程式結構

```
electron
├── build
├── config.js
├── lib
│   └── pre-load.js
├── assets
│   └── css
│      └── style.css
│   └── html
│      └── index.html
├── main.js
├── package-lock.json
├── package.json
├── readme-zh-TW.md
└── readme.md
```

### 基礎

本項目中,我們最主要會利用 electron 的 `app` 和 `BrowserWindow` class.

1. app對應是程式的主执行绪. 用作對BrowserWindow的控制.

2. BrowserWindow對應是瀏覽器視窗.

#### 展示網站

在 `createWindow()`, 視窗打開的方法會不同.

```javascript
win.loadURL(config.url);
```

```javascript
win.loadFile(config.url);
```

### MacOs環境的用戶體驗

Mac的用戶體驗針對程式的關閉和開啟有不同於 linux或window 的處理.

1. 關閉(close)
   - 快捷鍵: `cmd + w`
   - 在用家使用瀏覽器關閉按扭, 瀏覽器會消失, 但在dock 仍然可以看到程式的icon
   - 對應 electon BrowserWindow 的事件: `close`

    所以要針對 MacOs加上 `re-open` 和 `close`的處理：

    1.1: 在所有瀏覽器視窗都關閉時, 檢查操作系統. 如果不是 MacOs (darwin), 則觸發 `quit`.
    ```js
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') 
            app.quit();
    });
    ```

    1.2: 在程序執行(`ready`)後, 生成瀏覽器視窗.同時監聽`activate` 的事件,若程式在close的狀態下並且沒有運作中的瀏覽器視窗,重生啟用程式.
    ```js
    app.on('ready', () => {
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
    ```


2. 離開(quit/terminate)
   - 快捷鍵: `cmd + q`
   - 對應 electon BrowserWindow 的事件: `quit`
    
    不用額外的處理, `quit`的事件跟其他操作系統的體驗一樣。

潛在的生命週期:

> Open -> close (cmd + w) -> quit (cmd + q)

> Open -> close (cmd + w) -> activate -> quit (cmd + q)

## 封裝生產環境程式

### 背景

支援平台:
- Windows (32/64 bit)
- macOS (formerly known as OS X)
- Linux (x86/x86_64)

系統需求:
- Node.js 10.0

安裝:
```bash
npm install --g electron-packager
```

### 參數

#### 共用參數

參數 | 類型 | 描述
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

#### MacOS 參數

參數 | 類型 | 描述
--- | --- | --- 
appBundleId | string | The bundle identifier to use in the application's `Info.plist` 
appCategoryType | string | The application category type, as shown in the Finder via  View → Arrange by Application
darwinDarkModeSupport | boolean | Forces support for Mojave (macOS 10.14) dark mode in your packaged app. This sets the `NSRequiresAquaSystemAppearance` key to `false` in your app's `Info.plist`.
extendInfo | string or { [property: string]: any } | When the value is a string, specifies the filename of a `plist` file. Its contents are merged into the app's `Info.plist`. When the value is an `Object`, it specifies an already-parsed `plist` data structure that is merged into the app's `Info.plist`.
extendHelperInfo | string or { [property: string]: any } | When the value is a string, specifies the filename of a `plist` file. Its contents are merged into all the Helper apps' `Info.plist` files. When the value is an `Object`, it specifies an already-parsed `plist` data structure that is merged into all the Helper apps' `Info.plist` files.

#### Windows 參數

參數 | 類型 | 描述
--- | --- | --- 
win32metadata | Win32MetadataOptions | Application metadata to embed into the Windows executable.

### 例子

#### 封裝MacOs程式

```bash
electron-packager . app-mac --app-version=0.0.1 --platform=darwin --arch=x64 --asar --prune --out=./build
```

#### 封裝Linux程式

```bash
electron-packager . app-linux --app-version=0.0.1 --platform=linux --arch=x64 --asar --prune --out=./build
```

#### 封裝Windows程式

```bash
electron-packager . app-linux --app-version=0.0.1 --platform=win32 --arch=ia32 --asar --prune --out=./build
```

## 相關閱讀

[Electron官方網站](https://www.electronjs.org/)

[Electron教學](https://github.com/electron/electron-quick-start)

[Electron packager Github](https://github.com/electron/electron-packager)

[BrowserWindow設定](https://www.electronjs.org/docs/latest/api/browser-window)