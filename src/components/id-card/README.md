# ID Card Design System

এই সিস্টেম ব্যবহার করে আপনি সহজেই নতুন ID card design যোগ করতে পারবেন।

## বর্তমান Designs

1. **Modern (আধুনিক)** - Blue theme, horizontal/vertical layout
2. **Classic (ক্লাসিক)** - Golden theme, centered layout with decorative corners
3. **Minimal (মিনিমাল)** - Gray theme, clean left-aligned layout
4. **Professional (পেশাদার)** - Teal theme, split vertical panel design

## নতুন Design যোগ করার পদ্ধতি

### Step 1: Design Configuration যোগ করুন

`IDCardTemplates.js` ফাইলে গিয়ে `CardDesigns` object এ নতুন design যোগ করুন:

```javascript
export const CardDesigns = {
    // ... existing designs ...
    
    elegant: {
        name: 'Elegant',
        namebn: 'মার্জিত',
        description: 'Purple elegant style',
        descriptionbn: 'বেগুনি মার্জিত স্টাইল',
        front: {
            gradient: 'from-purple-50 via-white to-purple-50',
            border: 'border-purple-300',
            headerBorder: 'border-purple-200',
            headerText: 'text-purple-900',
            subText: 'text-purple-700',
            avatarBorder: 'border-purple-400',
            avatarBg: 'bg-purple-100',
            avatarText: 'text-purple-800',
            footerBg: 'bg-purple-50',
            footerBorder: 'border-purple-200',
            footerText: 'text-purple-900',
            patternColor: '#a855f7',
        },
        back: {
            gradient: 'from-pink-50 via-white to-pink-50',
            border: 'border-pink-300',
            headerBorder: 'border-pink-200',
            headerText: 'text-pink-900',
            sectionBg: 'bg-pink-50',
            sectionBorder: 'border-pink-200',
            emergencyBg: 'bg-red-50',
            emergencyBorder: 'border-red-200',
            patternColor: '#ec4899',
        },
    },
}
```

### Step 2: Front Layout তৈরি করুন

`IDCardFront.jsx` ফাইলে নতুন design এর layout যোগ করুন:

```javascript
// Elegant Design Layout
if (design === 'elegant') {
    return (
        <div
            className={`id-card-front relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
            style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: '14px',
            }}
        >
            {/* আপনার custom layout এখানে */}
            <div className="relative h-full flex flex-col p-3">
                {/* Header, Photo, Info, Footer etc. */}
            </div>
        </div>
    )
}
```

### Step 3: Back Layout তৈরি করুন

`IDCardBack.jsx` ফাইলে নতুন design এর back layout যোগ করুন:

```javascript
// Elegant Design Layout
if (design === 'elegant') {
    return (
        <div
            className={`id-card-back relative overflow-hidden bg-gradient-to-br ${designStyle.gradient} border-2 ${designStyle.border} shadow-lg`}
            style={{
                width: cardWidth,
                height: cardHeight,
                borderRadius: '14px',
            }}
        >
            {/* আপনার custom layout এখানে */}
        </div>
    )
}
```

### Step 4: স্বয়ংক্রিয়ভাবে Modal এ দেখাবে

এতটুকু করলেই নতুন design:

- ✅ Modal এর design selector এ দেখাবে
- ✅ Mini preview card সহ
- ✅ Bengali ও English name support
- ✅ Print modal এ কাজ করবে
- ✅ Preview panel এ দেখাবে

## Design Guidelines

### Color Themes

- `gradient`: Background gradient colors
- `border`: Main border color
- `headerText`: Header text color
- `subText`: Secondary text color
- `avatarBorder`: Avatar border color
- `footerBg`: Footer background color
- `patternColor`: Background pattern color (hex code)

### Layout Tips

1. বিভিন্ন alignment ব্যবহার করুন (left, center, right)
2. Unique element positioning করুন
3. Card এর orientation (landscape/portrait) handle করুন
4. Print করার সময় scale ঠিক থাকে ensure করুন

## File Structure

```
id-card/
├── IDCardTemplates.js      # Design configurations
├── IDCardFront.jsx          # Front side layouts
├── IDCardBack.jsx           # Back side layouts
├── IDCardPrintModal.jsx     # Print modal with selector
├── index.js                 # Barrel exports
└── README.md               # This file
```

## Tips

1. **Existing design copy করুন** - শুরুতে একটা existing design copy করে modify করুন
2. **Colors consistent রাখুন** - Front ও back এর colors harmonious রাখুন
3. **Text size maintain করুন** - Print করার সময় readable থাকতে হবে
4. **Test করুন** - Landscape ও portrait উভয় orientation এ test করুন
5. **Print test করুন** - Actual print করে দেখুন কেমন হচ্ছে

## Need Help?

Existing 4টি design study করুন:

- `modern` - Standard layout
- `classic` - Centered with decorations
- `minimal` - Clean and simple
- `professional` - Split panel style

এদের code দেখে নিজের design তৈরি করতে পারবেন!
