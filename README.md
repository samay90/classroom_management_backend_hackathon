<h1>Classroom Management Backend</h1>
<h2>Release Notes</h2>

1) SignUp (POST) (/auth/signup)
    - Allowed Fields : email, phone_no, password, first_name, last_name
    - Required Fields : All Allowed Fields
    - Conditions :
        - All the fields should be in string.
        - Email, Phone_no should have its basic format.
        - Password should contain atleast 1 special character.
    - Response : token
2) Login (POST) (/auth/login)
    - Allowed Fields : authenticator, password
    - Required Fields : All Allowed Fields
    - Conditions :
        - User should be verified and non-deleted
        - authenticator should be either of email and phone_no
        - Password should be valid
    - Response : token
    - Header : Bearer Token
    - Allowed Fields : hospital,specialization,education,open_time,close_time,
    - Required Fields : All allowed fields
    - Conditions :
        - Hospital, specialization, education should in string format
        - open_time and close_time should be in integer format and 0 < open_time < close_time < 24
        - Doctor should have applied before
3) Update Profile (POST) (/user/profile/update)
    - Header : Bearer Token
    - Allowed Fields : first_name, last_name, dob, bio, profile,city,state,country
    - Required Fields : Atleast 1 field from Allowed Fields
    - Conditons :
        - first_name, last_name, bio, city,state,country should be string format
        - dob should be a valid date of any format
        - Profile picture should be of type PNG, JPG, JPEG and size less than 1MB
4) View Profile (GET) (/user/profile)
    - Header : Bearer Token
    - Allowed Fields : No fields
    - Conditions :
        - Normal User authentic conditions
    - Response : All the user data
5) Create Classroom (POST) (/user/class/new)
    - Header : Bearer Token
    - Allowed Fields : class_name, class_description, join_password
    - Required Fields : All allowed fields
    - Conditions :
        - Basic conditions
    - Response : join_code and join_password
6) Join Classroom (POST) (/user/class/join)
    - Header : Bearer Token
    - Allowed Fields : join_code, join_password
    - Required Fields : All allowed Fields
    - Conditions :
        - join_code should be valid
        - join_password should be valid
        - user should not have any role in that classroom
     - Response : Basic