## Nodejs Authentication  
  
### Features:  
    - Sign up with email
    - Sign in 
    - Sign out
    - Reset password after sign in
    - The password stored in encrypted form in the db 
    - Google login (Social authentication)
    - Forgot password (send a reset password link on email id which expires in some time)

### Folder Structure:
    config
        passport.js
    controllers
        index.js
    models
        users.js
    public
        css
            change_password.css
            forgot_style.css
            reset.css
            styles.css
        js
            change_password.js
            login.js
            register.js
            reset.js
    routes
        index.js
    views
        change-password.ejs
        forgot.ejs
        home.ejs
        layout.ejs
        login.ejs
        register.ejs
        reset.ejs
    app.js