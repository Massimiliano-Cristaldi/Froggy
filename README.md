# Froggy
Thanks for using **Froggy**!

Froggy is a simple tool that helps you move your text cursor quickly using intuitive keyboard shortcuts.

## IMPORTANT: Read this if you're using Linux

There are two important caveats when using this extension on Linux:

### 1. OS Shortcut Conflicts
Some default shortcuts may be captured by your system, including:

- `Ctrl + Alt + Arrow`
- `Ctrl + Alt + Shift + Arrow`

If these don't work, you’ll need to disable or remap them using tools such as `dconf-editor`.

---

### 2. Preview Feature Requires Root Permissions
The **line preview feature** (holding `Ctrl` or `Ctrl + Alt`) depends on the `sudo-prompt` package, which requires you to grant root permissions to it.

If you're uncomfortable with this, feel free to fork this repository and package your own version of this extension without this feature.

---

## Default Keybindings

### Movement

| Action | Shortcut |
|--------|-----------|
| Go up 5 lines | `Ctrl + ↑` |
| Go down 5 lines | `Ctrl + ↓` |
| Go up 10 lines | `Ctrl + Alt + ↑` |
| Go down 10 lines | `Ctrl + Alt + ↓` |
| Go to previous whitespace | `Ctrl + Alt + 1` |
| Go to next whitespace | `Ctrl + Alt + 3` |
| Go to previous word (case-smart) | `Alt + ←` |
| Go to next word (case-smart) | `Alt + →` |
| Go to line start | `Ctrl + Alt + ←` |
| To go line end | `Ctrl + Alt + →` |
| Go to first whitespace occurrence right/left | `Ctrl + Numpad 1/3` |
| Go to second whitespace occurrence right/left | `Ctrl + Alt + Numpad 1/3` |

---

### Selection (Shift + Movement)

| Action | Shortcut |
|-----------|-----------|
| Expand/shrink up 5 lines | `Ctrl + Shift + ↑` |
| Expand/shrink down 5 lines | `Ctrl + Shift + ↓` |
| Expand/shrink up 10 lines | `Ctrl + Alt + Shift + ↑` |
| Expand/shrink down 10 lines | `Ctrl + Alt + Shift + ↓` |
| Expand to previous word | `Alt + Shift + ←` |
| Expand to next word | `Alt + Shift + →` |
| Expand to line start | `Ctrl + Alt + Shift + ←` |
| Expand to line end | `Ctrl + Alt + Shift + →` |

---

## You can refer to this table in order to remember these shortcuts easily

| Key | Meaning |
|---------|-----------|
| `Ctrl` | Small jump |
| `Ctrl + Alt` | Large jump |
| `Alt` | Case-smart word jump |
| `+ Shift` | Select instead of moving |

---

## Line Preview Feature

Hold:

- `Ctrl`
- or `Ctrl + Alt`

to preview where the cursor/selection will jump before committing.
