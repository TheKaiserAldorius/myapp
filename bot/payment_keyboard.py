from aiogram import types

# две кнопки для примера
topup_keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
    [
        types.InlineKeyboardButton(text="50 ⭐ (5 XTR)", callback_data="topup_50"),
        types.InlineKeyboardButton(text="100 ⭐ (10 XTR)", callback_data="topup_100"),
    ],
    [
        types.InlineKeyboardButton(text="200 ⭐ (20 XTR)", callback_data="topup_200"),
    ]
])
