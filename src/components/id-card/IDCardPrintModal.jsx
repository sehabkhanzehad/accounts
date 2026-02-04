import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Printer, CreditCard } from 'lucide-react'
import { IDCardFront } from './IDCardFront'
import { IDCardBack } from './IDCardBack'
import { IDCardSizes, PrintOrientations, CardOrientations, CardDesigns } from './IDCardTemplates'

/**
 * Helper function to get design description
 * Automatically pulls from CardDesigns if description exists
 */
const getDesignDescription = (design) => {
    return CardDesigns[design]?.description || ''
}

const getDesignDescriptionBn = (design) => {
    return CardDesigns[design]?.descriptionbn || ''
}

export function IDCardPrintModal({ open, onOpenChange, pilgrims = [], packageInfo, companyInfo }) {
    const { t } = useI18n()
    const [selectedSize, setSelectedSize] = useState('standard')
    const [cardOrientation, setCardOrientation] = useState('landscape')
    const [selectedDesign, setSelectedDesign] = useState('modern')
    const printMode = 'double'

    const handlePrint = () => {
        const size = IDCardSizes[selectedSize]
        const isPortrait = cardOrientation === 'portrait'
        const cardWidth = isPortrait ? size.heightPx : size.widthPx
        const cardHeight = isPortrait ? size.widthPx : size.heightPx

        // A4 dimensions in pixels (at 96 DPI): 794px × 1123px
        const a4Width = 794
        const a4Height = 1123
        const margin = 20
        const gap = 15

        // Calculate how many cards fit per A4 page
        const cardsPerRow = Math.floor((a4Width - 2 * margin + gap) / (cardWidth + gap))
        const cardsPerCol = Math.floor((a4Height - 2 * margin + gap) / (cardHeight + gap))
        const cardsPerPage = cardsPerRow * cardsPerCol

        // Group all cards (front + back) into pages
        let allCards = []
        pilgrims.forEach((pilgrim, index) => {
            const frontCard = document.getElementById(`id-card-front-${index}`)
            const backCard = document.getElementById(`id-card-back-${index}`)

            if (frontCard) {
                allCards.push(frontCard.outerHTML)
            }
            if (printMode === 'double' && backCard) {
                allCards.push(backCard.outerHTML)
            }
        })

        // Create pages with grid layout
        let pagesHtml = ''
        for (let i = 0; i < allCards.length; i += cardsPerPage) {
            const pageCards = allCards.slice(i, i + cardsPerPage)
            const cardsHtml = pageCards.map(card => `<div class="card-item">${card}</div>`).join('')
            pagesHtml += `<div class="page">${cardsHtml}</div>`
        }

        const css = `
            @page {
                size: A4;
                margin: 0;
            }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                background: white;
            }
            .page {
                width: ${a4Width}px;
                height: ${a4Height}px;
                padding: ${margin}px;
                page-break-after: always;
                display: grid;
                grid-template-columns: repeat(${cardsPerRow}, ${cardWidth}px);
                grid-template-rows: repeat(${cardsPerCol}, ${cardHeight}px);
                gap: ${gap}px;
                justify-content: center;
                align-content: center;
                background: white;
            }
            .page:last-child {
                page-break-after: auto;
            }
            .card-item {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .id-card-front, .id-card-back {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            /* Avatar image styles for print */
            img {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            span[role="img"],
            span.inline-flex {
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
            }
            span[role="img"] img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: inherit;
            }
            @media print {
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
                img {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    max-width: 100%;
                }
            }
        `

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Pilgrim ID Cards - ${pilgrims.length} Card(s)</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>${css}</style>
            </head>
            <body>
                ${pagesHtml}
            </body>
            </html>
        `

        // Create hidden iframe
        const iframe = document.createElement('iframe')
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = 'none'
        document.body.appendChild(iframe)

        // Write content to iframe
        const iframeDoc = iframe.contentWindow.document
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()

        // Wait for content to load, then print
        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.focus()
                iframe.contentWindow.print()

                // Remove iframe after printing
                setTimeout(() => {
                    document.body.removeChild(iframe)
                }, 1000)
            }, 500)
        }
    }

    const size = IDCardSizes[selectedSize]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-7xl p-0 flex flex-col bg-background">
                <SheetHeader className="px-6 py-4 border-b border-border">
                    <SheetTitle className="text-foreground">{t({ en: "Print ID Cards", bn: "আইডি কার্ড প্রিন্ট করুন" })}</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                        Preview and customize ID card settings before printing.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Settings */}
                    <div className="w-80 border-r border-border bg-background overflow-y-auto px-6 py-4">
                        <div className="space-y-6">
                            {/* Design Selection with Visual Previews */}
                            <div>
                                <Label className="text-sm font-medium mb-3 block">
                                    {t({ en: "Card Design", bn: "কার্ড ডিজাইন" })}
                                </Label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(CardDesigns).map(([key, designData]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedDesign(key)}
                                            className={`group relative p-3 rounded-lg border-2 transition-all text-left ${selectedDesign === key
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                                                : 'border-border hover:border-primary/50 bg-card hover:bg-accent/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {t({ en: designData.name, bn: designData.namebn })}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                                        {t({ en: getDesignDescription(key), bn: getDesignDescriptionBn(key) })}
                                                    </div>
                                                </div>
                                                {selectedDesign === key && (
                                                    <div className="flex-shrink-0 ml-2">
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation Selection */}
                            <div>
                                <Label className="text-sm font-medium mb-3 block">
                                    {t({ en: "Card Orientation", bn: "কার্ড ওরিয়েন্টেশন" })}
                                </Label>
                                <RadioGroup value={cardOrientation} onValueChange={setCardOrientation}>
                                    <div className="flex gap-4">
                                        {Object.entries(CardOrientations).map(([key, orientation]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <RadioGroupItem value={key} id={`orientation-${key}`} />
                                                <label htmlFor={`orientation-${key}`} className="cursor-pointer text-sm">
                                                    {t({ en: orientation.name, bn: orientation.namebn })}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Size Selection */}
                            <div>
                                <Label className="text-sm font-medium mb-3 block">
                                    {t({ en: "Card Size", bn: "কার্ড সাইজ" })}
                                </Label>
                                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(IDCardSizes).map(([key, sizeData]) => (
                                            <div key={key} className="flex items-start space-x-2">
                                                <RadioGroupItem value={key} id={key} />
                                                <label htmlFor={key} className="cursor-pointer flex-1">
                                                    <div className="text-sm font-medium">
                                                        {t({ en: sizeData.name, bn: sizeData.namebn })}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {sizeData.width} × {sizeData.height}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="flex-1 overflow-y-auto bg-muted/30 dark:bg-muted/20 p-6">
                        <div className="max-w-xl mx-auto">
                            <div className="space-y-6">
                                {pilgrims.slice(0, 1).map((pilgrim, index) => (
                                    <div key={index} className="space-y-4">
                                        <div className="flex justify-center">
                                            <div id={`id-card-front-${index}`} className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10 rounded-xl">
                                                <IDCardFront
                                                    pilgrim={pilgrim}
                                                    packageInfo={packageInfo}
                                                    size={size}
                                                    orientation={cardOrientation}
                                                    design={selectedDesign}
                                                    companyInfo={companyInfo}
                                                />
                                            </div>
                                        </div>
                                        {printMode === 'double' && (
                                            <div className="flex justify-center">
                                                <div id={`id-card-back-${index}`} className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10 rounded-xl">
                                                    <IDCardBack
                                                        pilgrim={pilgrim}
                                                        packageInfo={packageInfo}
                                                        size={size}
                                                        orientation={cardOrientation}
                                                        design={selectedDesign}
                                                        companyInfo={companyInfo}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hidden cards for printing */}
                        <div className="hidden">
                            {pilgrims.slice(1).map((pilgrim, index) => (
                                <div key={index + 1}>
                                    <div id={`id-card-front-${index + 1}`}>
                                        <IDCardFront
                                            pilgrim={pilgrim}
                                            packageInfo={packageInfo}
                                            size={size}
                                            orientation={cardOrientation}
                                            design={selectedDesign}
                                            companyInfo={companyInfo}
                                        />
                                    </div>
                                    {printMode === 'double' && (
                                        <div id={`id-card-back-${index + 1}`}>
                                            <IDCardBack
                                                pilgrim={pilgrim}
                                                packageInfo={packageInfo}
                                                size={size}
                                                orientation={cardOrientation}
                                                design={selectedDesign}
                                                companyInfo={companyInfo}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border shrink-0 bg-background">
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            {t({ en: "Cancel", bn: "বাতিল" })}
                        </Button>
                        <Button onClick={handlePrint} className="flex-1 gap-2">
                            <Printer className="h-4 w-4" />
                            {t({ en: "Print Cards", bn: "কার্ড প্রিন্ট করুন" })}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
