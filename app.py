import os
import sqlite3
from flask import Flask, render_template, request, redirect, session, url_for, flash
from flask_session import Session
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from threading import Thread
from datetime import timedelta
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash

# Configure session to use filesystem (instead of signed cookies)
app = Flask(__name__)
app.config["SESSION_TYPE"] = "filesystem"
app.config['SECRET_KEY'] = os.urandom(64)
app.config.from_pyfile('services/config.cfg')
Session(app)

mail = Mail(app)

s = URLSafeTimedSerializer(app.secret_key)


def verify_reset_token(token):
    try:
        username = jwt.decode(token,
                              key=os.getenv('SECRET_KEY_FLASK'))['reset_password']
    except Exception as e:
        print(e)
        return
    return User.query.filter_by(username=username).first()


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'GET':
        # user_places = db.execute("SELECT place_name FROM users WHERE user_id=?", (session["user_id"],))
        if 'user_id' in session:
            # config database
            conn = sqlite3.connect('database.db')
            conn.row_factory = sqlite3.Row
            db = conn.cursor()

            db.execute(
                "SELECT place_name FROM places WHERE user_id=?", (session["user_id"],))

            place = db.fetchall()

            if place:
                return render_template('index.html', place=place)
            else:
                return render_template('index.html')

        else:
            return render_template('index.html')

    else:
        # config database
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        db = conn.cursor()

        save_place = request.form.get("save_user_place")

        user_place_already_saved = db.execute(
            "SELECT place_name FROM places WHERE user_id=? AND place_name=?", (session["user_id"], save_place))

        if user_place_already_saved.fetchone():
            flash('Ezt a települést már elmentetted korábban.')
            return redirect(url_for('index'))

        db.execute("INSERT INTO places (user_id, place_name) VALUES (:user_id, :place_name)", {
                   "user_id": session["user_id"], "place_name": save_place})
        # Save (commit) the changes
        conn.commit()
        conn.close()

        return redirect('/')


@app.route('/login', methods=['GET', 'POST'])
def login():

    session.clear()

    if request.method == 'POST':
        # config database
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        db = conn.cursor()

        username = request.form.get("username")
        # Query database for username
        db_user = db.execute(
            "SELECT * FROM users WHERE user_name=?", (username,))

        db_string_user = db_user.fetchall()

        """ db_user_id = db_string_user[0][0]
        db_user_name = db_string_user[0][1]
        db_user_hash = db_string_user[0][2] """

        if db_string_user == []:
            flash('Felhasználónév nem található.')
            return render_template("login.html")

        # Ensure username exists and password is correct
        if username != db_string_user[0][1] or not check_password_hash(db_string_user[0][2], request.form.get("password")):
            flash('Hibás jelszó.')
            return render_template("login.html")
        else:
            if db_string_user[0][4] != 1:
                return render_template('confirm_email.html')
            else:
                session['user_id'] = db_string_user[0][0]
                conn.close()
                return redirect('/')

    else:
        return render_template("login.html")


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        # config database
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        db = conn.cursor()

        username = request.form.get("username")
        username_used = db.execute(
            "SELECT user_name FROM users WHERE user_name=?", (username,))

        if username_used.fetchone():
            flash('Ezzel a felhasznlónévvel már regisztráltak korábban. Válassz másikat.')
            return render_template("register.html")

        password = request.form.get("password")
        hash = generate_password_hash(request.form.get(
            "password"), method='pbkdf2:sha256', salt_length=8)

        email = (request.form.get("emailaddress")).lower()
        email_used = db.execute(
            "SELECT email_address FROM users WHERE email_address=?", (email,))

        if email_used.fetchone():
            flash('Ezzel az e-mail-címmel már regisztráltak korábban. Válassz másikat.')
            return render_template("register.html")

        db.execute("INSERT INTO users (user_name, hash, email_address) VALUES (:username, :hash, :email_address)", {
                   "username": username, "hash": hash, "email_address": email})

        # Save (commit) the changes
        conn.commit()
        conn.close()

        token = s.dumps(email, salt='email-confirm')

        msg = Message('E-mail-cím jóváhagyása',
                      sender='rendszer-uzenet@leszkapas.hu', recipients=[email])

        link = url_for('confirm_email', token=token, _external=True)

        msg.body = 'Erre a linkre kattintva hagyhatod jóvá a megadott e-mail-címed: {}'.format(
            link)

        mail.send(msg)

        flash('Sikeres regisztráció!')
        return render_template('confirm_email.html', email=email)


@app.route('/confirm_email/<token>')
def confirm_email(token):
    try:
        email = s.loads(token, salt='email-confirm', max_age=1800)
        print(email)
    except SignatureExpired:
        return 'the token expired'

    # config database
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    db = conn.cursor()

    db.execute("UPDATE users SET confirmed=? WHERE email_address=?",
               (1, email,))

    conn.commit()
    conn.close()

    return redirect('/login')


@app.route('/reset', methods=["GET", "POST"])
def reset():
    if request.method == 'POST':
        conn = sqlite3.connect('database.db')
        db = conn.cursor()

        email = request.form.get("emailaddress")

        if email:
            result = db.execute(
                "SELECT confirmed FROM users WHERE email_address=?", (email,))

            print(email)
            confirmed_user = result.fetchone()[0]
            print(confirmed_user)

            if confirmed_user == 1:
                token = s.dumps(email, salt='password-reset')

                msg = Message('Lesz kapás? - Új jelszó megadása',
                              sender='rendszer-uzenet@leszkapas.hu', recipients=[email])

                link = url_for('reset_with_token', token=token, _external=True)

                msg.body = 'Erre a linkre kattintva új jelszót adhatsz meg: {}'.format(
                    link)

                mail.send(msg)

                flash('E-mail elküldve!')
                return redirect(url_for('index'))
            else:
                conn.commit()
                conn.close()

                flash('Fiókod nincs jóváhagyva.')
                return redirect(url_for('index'))
    else:
        return render_template('reset.html')


@app.route('/reset/<token>', methods=["GET", "POST"])
def reset_with_token(token):
    try:
        email = s.loads(token, salt="password-reset", max_age=86400)
    except:
        flash('A jelszó link lejárt.')
        return redirect(url_for('index'))

    password = request.form.get("password")

    if password:
        conn = sqlite3.connect('database.db')
        db = conn.cursor()

        hash = generate_password_hash(request.form.get(
            "password"), method='pbkdf2:sha256', salt_length=8)

        db.execute("UPDATE users SET hash=? WHERE email_address=?",
                   (hash, email,))

        conn.commit()
        conn.close()

        return redirect(url_for('login'))

    return render_template('reset_with_token.html', token=token)


@app.route('/account', methods=['GET', 'POST'])
def account():
    if request.method == 'GET':
        if 'user_id' in session:
            # config database
            conn = sqlite3.connect('database.db')
            conn.row_factory = sqlite3.Row
            db = conn.cursor()

            db.execute(
                "SELECT user_name, email_address FROM users WHERE id=?", (session['user_id'],))
            result = db.fetchall()
            user_name = result[0][0]
            email_address = result[0][1]

            db.execute("SELECT place_name FROM places WHERE user_id=?",
                       (session['user_id'],))
            user_places = db.fetchall()

            # Save (commit) the changes
            conn.commit()
            conn.close()

            return render_template('account.html', user_name=user_name, email_address=email_address, user_places=user_places)
        else:
            return render_template('login.html')

    else:
        # config database
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        db = conn.cursor()

        db_user = db.execute(
            "SELECT * FROM users WHERE id=?", (session['user_id'],))

        db_string_user = db_user.fetchall()
        db_user_old_name = db_string_user[0][1]
        db_user_old_email = db_string_user[0][3]

        user_new_name = request.form.get("new_username")
        new_email = request.form.get("new_emailaddress")

        if user_new_name:
            username_used = db.execute(
                "SELECT user_name FROM users WHERE user_name=?", (user_new_name,))
            if username_used.fetchone():
                flash(
                    'Ezzel a felhasznlónévvel már regisztráltak korábban. Válassz másikat.')
                return redirect(url_for('account'))
            else:
                db.execute("UPDATE users SET user_name=? WHERE id=?",
                           (user_new_name, session['user_id'],))
                conn.commit()

        if new_email:
            email_used = db.execute(
                "SELECT email_address FROM users WHERE email_address=?", (new_email,))

            if email_used.fetchone():
                flash(
                    'Ezzel az e-mail-címmel már regisztráltak korábban. Válassz másikat.')
                return redirect(url_for('account'))
            else:
                db.execute("UPDATE users SET email_address=? WHERE id=?",
                           (new_email, session['user_id'],))
                conn.commit()

        # Save (commit) the changes
        conn.close()

    return redirect('/account')


@ app.route('/passwordupdate', methods=['POST', 'GET'])
def passwordupdate():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    db = conn.cursor()

    db_user = db.execute(
        "SELECT * FROM users WHERE id=?", (session['user_id'],))

    db_string_user = db_user.fetchall()
    db_user_old_hash = db_string_user[0][2]

    new_hash = generate_password_hash(request.form.get(
        "new_password"), method='pbkdf2:sha256', salt_length=8)

    # check if old password does match
    if not check_password_hash(db_user_old_hash, request.form.get("old_password")):
        return 'régi jelszó nem egyezik meg'
    else:
        db.execute("UPDATE users SET hash=? WHERE id=?",
                   (new_hash, session["user_id"],))

    # Save (commit) the changes
    conn.commit()
    conn.close()

    return redirect('/account')


@ app.route('/placesupdate', methods=['POST', 'GET'])
def placesupdate():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    db = conn.cursor()

    print(request.form.getlist('places_list'))
    delete_list = request.form.getlist('places_list')

    for place in delete_list:
        db.execute("DELETE FROM places WHERE place_name=? AND user_id=?",
                   (place, session['user_id'],))
        print(place)

    # Save (commit) the changes
    conn.commit()
    conn.close()

    return redirect('/account')


@ app.route('/logout')
def logout():
    # Forget any user_id
    session['user_id'] = None

    # Redirect user to login form
    return redirect('/')


@ app.route('/about')
def about():
    return render_template('/about.html')


@ app.route('/contact', methods=['POST', 'GET'])
def contact():
    if request.method == 'GET':
        return render_template('/contact.html')
    else:
        name = request.form.get("name")
        email = request.form.get("emailaddress")
        message = request.form.get("message")

        msg = Message('Lesz kapás? info - {}'.format(name),
                      sender=email, recipients=['info@leszkapas.hu'])

        msg.body = message

        mail.send(msg)

        flash('E-mail elküldve!')
        return redirect(url_for('index'))
