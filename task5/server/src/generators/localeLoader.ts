import { Faker, en, de, fr, base } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'

const fakerLocaleMap: Record<string, any> = { en, de, fr }

const fakerInstances: Record<string, Faker> = {}

export function getFaker(lang: string): Faker {
    if (fakerInstances[lang]) return fakerInstances[lang]

    const localePath = path.join(__dirname, '../locales', `${lang}.json`)

    if (!fs.existsSync(localePath)) {
        console.warn(`Locale ${lang} not found, falling back to en`)
        return getFaker('en')
    }

    const config = JSON.parse(fs.readFileSync(localePath, 'utf-8'))
    const primary = fakerLocaleMap[config.fakerLocale] ?? en
    const fallback = fakerLocaleMap[config.fallback] ?? en

    fakerInstances[lang] = new Faker({
        locale: [primary, fallback, base]
    })

    return fakerInstances[lang]
}

export function getAvailableLocales(): { value: string, label: string }[] {
    const localesDir = path.join(__dirname, '../locales')
    const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'))

    return files.map(file => {
        const lang = file.replace('.json', '')
        const config = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'))
        return { value: lang, label: config.label }
    })
}