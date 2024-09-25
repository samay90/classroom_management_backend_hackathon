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
3) Apply for Doctor (/user/apply/doctor)
    - Header : Bearer Token
    - Allowed Fields : hospital,specialization,education,open_time,close_time,
    - Required Fields : All allowed fields
    - Conditions :
        - Hospital, specialization, education should in string format
        - open_time and close_time should be in integer format and 0 < open_time < close_time < 24
        - Doctor should have applied before