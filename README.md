<h1>Appointment Booking Backend</h1>
<h2>Release Notes</h2>

1) SignUp (/auth/signup)
    - Allowed Fields : email, phone_no, password, first_name, last_name
    - Required Fields : All Allowed Fields
    - Conditions :
        - All the fields should be in string.
        - Email, Phone_no should have its basic format.
        - Password should contain atleast 1 special character.
    - Response : token
2) Login (/auth/login)
    - Allowed Fields : authenticator, password
    - Required Fields : All Allowed Fields
    - Conditions :
        - User should be verified and non-deleted
        - authenticator should be either of email and phone_no
        - Password should be valid
    - Response : token