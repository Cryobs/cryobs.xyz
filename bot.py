import os

import telebot
from dotenv import load_dotenv, dotenv_values

import mysql.connector


load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID"))

bot = telebot.TeleBot(TOKEN)

def is_admin(message):
    return message.from_user.id == ADMIN_ID;

@bot.message_handler(commands=['start', 'hello'])
def send_welcome(message):
    print("User id: " + message.from_user.id)
    if not is_admin(message):
        bot.reply_to(message, "exit")
        return
    bot.reply_to(message, "Okey send me a message and I cahnge status on website")

@bot.message_handler(commands=['change_status'])
def change_status(message):
    if not is_admin(message):
        bot.reply_to(message, "exit")
        return
    bot.reply_to(message, "Send new status (or /exit)")
    bot.register_next_step_handler(message, status_save)


def status_save(message):
    if not is_admin(message) or message.text.strip() == "/exit": 
        bot.reply_to(message, "exit")
        return
    status = message.text.strip()

    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_NAME"),
    )

    cursor = conn.cursor();

    cursor.execute("""
    UPDATE site_stats
    SET status = %s
    WHERE id = 1;
    """, (status,))

    conn.commit()
    cursor.close()
    conn.close()

    bot.reply_to(message, "New status: " + status)




bot.infinity_polling()

