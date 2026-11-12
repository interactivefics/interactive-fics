InteractiveFics

InteractiveFics is a browser extension for Reader Insert and second-person fiction. It replaces placeholders such as `Y/N`, `S/N`, and custom terms with the reader's preferred name or text.

It is designed for stories where the reader is represented by a variable, allowing the page to become more natural and personalized while reading.

## Features
<img width="380" height="361" alt="v3" src="https://github.com/user-attachments/assets/824526d7-31cb-482d-836b-f1b0d8a24b45" />
<img width="381" height="356" alt="v2" src="https://github.com/user-attachments/assets/43c4eb82-cf6d-4db9-b5ea-d2e0ece32044" />
<img width="383" height="571" alt="v1" src="https://github.com/user-attachments/assets/ae062b82-366b-4eaf-b8ff-1f7deccdf7c5" />

- Replace common placeholders such as `Y/N`, `Y/N`, `S/N`, and similar variants.
- Create custom replacement rules for terms such as `L/N`, `E/C`, or any other placeholder.
- Choose whether each replacement is case-sensitive.
- Save replacements and synchronize them through browser storage.
- Use temporary replacements for one-off reading sessions.
- Edit, protect, delete, export, and import saved replacements.
- Review replacements individually before applying them.
- Detect new content loaded dynamically on pages with infinite scrolling.
- Enable text selection and copying on supported websites that block those actions.
- Decode font-obfuscated text on supported Sangtacviet domains.
- Portuguese (Brazilian) and English interface.
- Light and dark themes.
- Context-menu shortcut for replacing a selected term.

## Installation

### Chrome and Chromium-based browsers

1. Download or clone this repository.
2. Open `chrome://extensions` in your browser.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the project folder.
6. Open the extension once and select your preferred language.

After installation, the extension opens a welcome page where you can choose Portuguese or English. The language can later be changed by clicking the flag button at the top of the extension popup.

### Android browsers

InteractiveFics may work in Android browsers that support Chromium or WebExtension extensions. Compatibility depends on the browser and on the APIs it implements. The official Chrome browser for Android does not generally support desktop extensions.

## Usage

### Replace Y/N with a name

1. Open the InteractiveFics popup.
2. Enter the name in the replacement field.
3. Apply the change.
4. Reload or open a fiction page.

The extension will replace common reader-insert placeholders with the chosen name.

### Add a custom replacement

Enter the term to find and the text that should replace it. You can choose whether the rule should be saved permanently or used only temporarily.

Examples:

| Find | Replace with |
| --- | --- |
| `L/N` | `Luna` |
| `E/C` | `blue eyes` |
| `MC` | `Alex` |

### Review mode

Review mode highlights each possible replacement instead of applying it immediately. Click a highlighted term to confirm the replacement individually.

### Dynamic pages and infinite scrolling

When **Detect page changes** is enabled, InteractiveFics checks new content added after the page loads. This is useful for websites that load chapters or story content while scrolling.

## Supported features and limitations

- The extension works on normal `http` and `https` pages where the browser allows content scripts.
- Some browser internal pages, PDF viewers, restricted frames, and protected content cannot be modified.
- Mobile browsers may support only part of the extension API. Popup tooltips and context-menu behavior can differ on touch devices.
- Websites that continuously rewrite the same text may require the page to be refreshed or the observer option to be enabled.
- The copy-enabling feature modifies page selection and copy handlers only for the selected domain.

## Privacy

InteractiveFics does not require an account or an external server for saved replacements. Replacement rules and preferences are stored using the browser's extension storage APIs.

The extension processes page text locally in the browser. It does not send reading history, replacement rules, or page content to a remote service.

## Permissions

The extension uses browser permissions for:

- `storage`: save preferences and replacement rules.
- `tabs`: identify the active page and reload it when necessary.
- `scripting`: enable copying on a user-selected page.
- `contextMenus`: provide the selected-text replacement shortcut.
- Website access: apply replacements on supported web pages.

## Development

This project is a Manifest V3 browser extension and does not require a build step or package manager.

The main files are:

```text
manifest.json              Extension configuration
background.js              Service worker and context-menu actions
content_script.js          Page replacements and dynamic-content observer
popup.html / popup.css     Extension popup interface
popup.js                   Popup behavior, settings, and translations
sangtacviet-decode.js      Sangtacviet font decoding
enable-copy/               Copy and text-selection support
welcome.*                  First-install language selection page
```

To test changes, reload the extension from `chrome://extensions` and refresh the active webpage.

## Credits

Art, logo, and copyright credits belong to Oleg Gert:

- https://www.oleggert.ru

## License

Please see the included license file for the terms that apply to this project.
