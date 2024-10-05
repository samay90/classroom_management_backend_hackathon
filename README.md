<h1>Classroom Management Backend</h1>
<h3 style="color:blue">#OnMission #MakingRevolutionaryThing #CurrentProject1</h3>
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
        - All the fields should be of type string
    - Response : join_code and join_password
6) Join Classroom (POST) (/user/class/join)
    - Header : Bearer Token
    - Allowed Fields : join_code, join_password
    - Required Fields : All allowed Fields
    - Conditions :
        - All fields should be of type string
        - join_code should be valid
        - join_password should be valid
        - user should not have any role in that classroom
     - Response : Basic
7) Update Classroom (POST) (/classroom/:class_id/edit)
    - Header : Bearer Token
    - Allowed Fields : class_name, class_desceription, join_password
    - Required Fields : Any one of Allowed Fields
    - Params : class_id
    - Conditions :
        - User should be creator of the class
        - class_id must be integral and class should exist
        - All the fields should be of type string
    - Response : Basic
8) Manage Classroom (POST) (/classroom/:class_id/manage)
    - Allowed Fields : user_id, action_type, action (T OR S)
    - Required Fields : user_id,action_type (R or M)
    - Header : Bearer Token
    - Conditions :
        - Both the users must be there in class
        - Main user must be the creator of the class
        - Cannot modify himself
        - If action_type is M then action should provided
    - Response : Basic
9) Add Resource (POST) (/classroom/:class_id/resource/new)
    - Allowed Fields : title, body, attachements
    - Required Fields : title
    - Header :  Bearer Token
    - Conditons : 
        - User must be a part and creator or teacher of the classroom.
        - title should be less 50chars and body must be less than 200chars.
        - attachments is files
    - Response : Basic