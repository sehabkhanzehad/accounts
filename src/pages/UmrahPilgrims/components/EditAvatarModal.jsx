import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { useI18n } from '@/contexts/I18nContext'

export function EditAvatarModal({ open, onOpenChange, currentAvatar, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()
    const [avatar, setAvatar] = useState(null)
    const [fileAction, setFileAction] = useState('keep') // 'keep', 'delete', or 'upload'

    const handleSubmit = () => {
        const formData = new FormData()

        if (fileAction === 'delete') {
            formData.append('avatar', '')
        } else if (fileAction === 'upload' && avatar instanceof File) {
            formData.append('avatar', avatar)
        }
        // If fileAction === 'keep', don't send avatar key at all (empty FormData)

        onSubmit(formData)
    }

    const handleAvatarChange = (file) => {
        setAvatar(file)
        setFileAction('upload')
    }

    const handleAvatarRemove = () => {
        setAvatar(null)
        setFileAction('delete')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-xs ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Edit Photo", bn: "ছবি এডিট করুন" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Update pilgrim's photo", bn: "পিলগ্রিমের ছবি আপডেট করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center py-6">
                    <ImageUpload
                        className="w-auto"
                        value={avatar instanceof File ? URL.createObjectURL(avatar) : currentAvatar}
                        onChange={handleAvatarChange}
                        onRemove={handleAvatarRemove}
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t({ en: "Cancel", bn: "বাতিল" })}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting
                            ? t({ en: "Updating...", bn: "আপডেট হচ্ছে..." })
                            : t({ en: "Update", bn: "আপডেট" })
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
