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

def db_connect():
    return mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_NAME"),
        )




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

    conn = db_connect()

    cursor = conn.cursor()

    cursor.execute("""
    UPDATE site_stats
    SET status = %s
    WHERE id = 1;
    """, (status,))

    conn.commit()
    cursor.close()
    conn.close()

    bot.reply_to(message, "New status: " + status)


@bot.message_handler(commands=['im_into'])
def im_into(message):
    if not is_admin(message):
        bot.reply_to(message, "exit")
        return
    bot.reply_to(message, "Send what you are into (or /exit)")
    bot.register_next_step_handler(message, add_im_into)

def add_im_into(message):
    if not is_admin(message) or message.text.strip() == "/exit": 
        bot.reply_to(message, "exit")
        return

    text = message.text.strip()

    conn = db_connect()


    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO im_into (text)
    VALUES (%s);
    """, (text,))

    conn.commit()
    cursor.close()
    conn.close()

    bot.reply_to(message, "You are into: " + text)


@bot.message_handler(commands=['add_sys_status'])
def sys_status(message):
    if not is_admin(message):
        bot.reply_to(message, "exit")
        return
    bot.reply_to(message, "Send system url; name (or /exit)")
    bot.register_next_step_handler(message, add_sys_status)



def add_sys_status(message):
    if not is_admin(message) or message.text.strip() == "/exit": 
        bot.reply_to(message, "exit")
        return

    parts = message.text.split(";", 2)

    sys_url = parts[0].strip()
    sys_name = parts[1].strip()

    conn = db_connect()

    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO sys_status (url, name, status)
    VALUES (%s, %s, %s);
    """, (sys_url, sys_name, "Test"))

    conn.commit()
    cursor.close()
    conn.close()

    bot.reply_to(message, f"New system {sys_name}: {sys_url}")




bot.infinity_polling()

