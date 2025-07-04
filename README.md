<h1>Classroom Management Backend</h1>
<h2>Release Notes</h2>
<p>Resource Link: https://drive.google.com/drive/folders/1fich77mtOneY6YfTKM0V2yyNBf5hHt3e?usp=sharing</p>

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
    - Allowed Fields : class_name, class_description
    - Required Fields : All allowed fields
    - Conditions :
        - All the fields should be of type string
    - Response : join_code

6) Join Classroom (POST) (/user/class/join)
    - Header : Bearer Token
    - Allowed Fields : join_code
    - Required Fields : All allowed Fields
    - Conditions :
        - All fields should be of type string
        - join_code should be valid
        - user should not have any role in that classroom
     - Response : Basic

7) Update Classroom (POST) (/classroom/:class_id/edit)
    - Header : Bearer Token
    - Allowed Fields : class_name, class_description, banner_id
    - Required Fields : Any one of Allowed Fields
    - Params : class_id
    - Conditions :
        - banner_id must be number
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
    - Allowed Fields : title, body, attachments
    - Required Fields : title
    - Params : class_id
    - Header :  Bearer Token
    - Conditons : 
        - User must be a part and creator or teacher of the classroom.
        - title should be less 50chars and body must be less than 200chars.
        - attachments is files
    - Response : Basic

10) View Resource (GET) (/classroom/:class_id/resource/:resource_id)
    - Params : class_id, resource_id
    - Header : Bearer Token
    - Conditions :
        - User must be the part of the classroom.
        - Resource should belong for particular classroom.
        - Resource should not be deleted
    - Response : All the details of resource and attachemtns.

11) Delete Resource (POST) (/classroom/:class_id/resource/:resource_id/delete)
    - Params : class_id, resource_id
    - Header : Bearer Token
    - Conditions :
        - User must be the creator or teacher of the classroom.
        - Resource should belong for particular classroom.
        - Resource should not be deleted
    - Response : Basic

12) Edit Resource (POST) (/classroom/:class_id/resource/:resource_id/edit)
    - Params : class_id, resource_id
    - Header : Bearer Token
    - Allowed Fields : body, title, delete_attachments, attachments
    - Required Fields : Any one of Allowed Fields
    - Conditions :
        - Resource should belong form same classroom
        - User should have creator or teacher role in the classroom
        - body should be less than 200chars and title less then 50chars
        - delete_attachments should be array of attachment ids in stringified format
        - attachments should be files
    - Response : Basic

13) Ask Query (POST) (/classroom/:class_id/resource/:resource_id/query/ask)
    - Params : class_id, resource_id
    - Header : Bearer Token
    - Allowed Fields : query_title, query_body
    - Required Fields : query_body
    - Conditions :
        - Resource should belong from same classroom
        - User should be student of that classroom
        - query_title should be less than 50chars and query_body should be less than 200chars

14) Edit Query (POST) (/classroom/:class_id/resource/:resource_id/query/:query_id/edit)
    - Params : class_id, resource_id, query_id
    - Header : Bearer Token
    - Allowed Fields : query_title, query_body
    - Required Fields : Anyone of the allowed fields
    - Conditions :
        - Resource should belong from same classroom
        - Query should belong from same resource
        - User should be student of that classroom and query should belong to user
        - query_title should be less than 50chars and query_body should be less than 200chars

15) Delete Query (DELETE) (/classroom/:class_id/resource/:resource_id/query/:query_id/delete)
    - Params : class_id, resource_id, query_id
    - Header : Bearer Token
    - Allowed Fields : None
    - Conditions :
        - Resource should belong from same classroom
        - User should be student of that classroom and query should belong to user
        - Query should belong from same resource

16) Solve Query (POST) (/classroom/:class_id/resource/:resource_id/query/:query_id/solve)
    - Params : class_id, resource_id, query_id
    - Header : Bearer Token
    - Allowed Fields : solution
    - Required Fields : solution
    - Conditions :
        - Resource should belong from same classroom
        - Query should belong from same resource
        - solution should be less than 500chars
        - user should be creator or teacher of the classroom

17) Mark Attendance (POST) (/classroom/:class_id/resource/:resource_id/attendance/mark)
    - Parmas : class_id, resource_id
    - Header : Bearer Token
    - Allowed Fields : attendance
    - Required Fields : All the allowed fields
    - Conditons :
        - Resource should belong from same classroom.
        - User must be either teacher or creator of the classrooom.
        - Attendance must be of the form {"user_id":(0/1),...}.
        - user_id of the each user in the attendance must be the student of the classroom.
        - The older attendance of students provided in attendance will get deleted.

18) Assign Assignment (POST) (/classroom/:class_id/assignments/new)
    - Parmas : class_id
    - Header : Bearer Token
    - Allowed Fields : title, body, due_date_time, total_marks, attachments (files)
    - Required Fields : title, due_date_time, total_marks
    - Conditions : 
        - Classroom should exist.
        - User should be creator or teacher of the class
        - due_date_time can be any valid format of the Javascript.
        - title shoulld be less than 50chars and body should be less than 200chars.
        - total_marks should be an integer.
    - Response : Basic

19) Edit Assignment (POST) (/classroom/:class_id/asssignment/:assignment_id/edit)
    - Params : class_id, assignment_id
    - Header : Bearer Token
    - Allowed Fields : title, body, due_date_time, total_marks, delete_attachments, attachments (files)
    - Required Fields : Anyone of the allowed fields
    - Conditions :
        - Classroom should exist.
        - User should be creator or teacher of the class
        - due_date_time can be any valid format of the Javascript.
        - title shoulld be less than 50chars and body should be less than 200chars.
        - total_marks should be an integer.
        - delete_attachments should be array of attachment ids in stringified format
        - attachments should be files
    - Response : Basic

20) Delete Assignment (POST) (/classroom/:class_id/assignment/:assignment_id/delete)
    - Params : class_id, assignment_id
    - Header : Bearer Token
    - Allowed Fields : Null
    - Required Fields : Null
    - Conditions : Null
        - Classroom should exist.
        - Assignment should exist and should belong from that classroom.
        - User should be creator or teacher of the class
    - Response : Basic


21) Submit Assignment (POST) (/classroom/:class_id/assignment/:assignment_id/submit)
    - Params : class_id, assignment_id
    - Header : Bearer Token
    - Allowed Fields : attachments (files)
    - Required Fields : attachments (files)
    - Conditions :
        - Classroom should exist.
        - User should be student of the class
        - Assignment should exist and should belong from that classroom.
        - current time should be less than due_date_time.
        - Previous submission should not be marked
        - Previous submission would automitically deleted.
        - attachments should be files
    - Response : Basic + paths of attachements

22) Mark Assignment (POST) (/classroom/:class_id/assignment/:assignment_id/submission/:submission_id
    - Params : class_id, assignment_id, submission_id
    - Header : Bearer Token
    - Allowed Fields : marks
    - Required Fields : marks
    - Conditions : 
        - Classroom should exist.
        - Submission should belong from its assignment .
        - User should be teacher or creator of the classroom.
        - Marks should less than total_marks of the assignment.
        - Submission should exist.

23) Get User Classrooms (GET) (/user/classrooms)
    - Header : Bearer Token
    - Response : 
        - Details for all the classrooms that user has joined

24) Get Classroom (GET) (/classroom/:class_id)
    - Header : Bearer Token
    - Params : class_id
    - Conditions :
        - User should be the member of the classroom
    - Response : 
        - All the data (resources and assignments) of the classrooms

25) Get Assignemnt (GET) (/classroom/:class_id/assignment/:assignment_id)
    - Header : Bearer Token
    - Params : class_id,assignment_id
    - Conditions:
        - User should be the member of the classroom
    - Response : 
        - All the data of the particular assignment

26) Get User query's (GET) (/classroom/:class_id/resource/:resource_id/queries)
    - Header : Bearer Token
    - Params : class_id,resource_id
    - Conditions: 
        - User should be the member of the classroom
    - Response : 
        - All the data of the particular assignment

27) Get Classroom sensitive information (GET) (/classroom/:class_id/sensitive)
    - Header : Bearer Token
    - Params : class_id
    - Conditions :
        - User should be creator of the classroom
    - Response : Info about the classroom
28) Get Classmates of a Classroom (GET) (/classroom/:class_id/class)
    - Header : Bearer Token
    - Params : class_id
    - Conditions :
        - User should be part of the classroom
    - Response : All the info of class.
29) Get Data of Particular user of classroom (GET) (/classroom/:class_id/class/:user_id)
    - Header : Bearer Token
    - Params : class_id, user_id
    - Conditions :
        - User should be part of the classroom
        - requested user should also be the part of the classroom
    - Response : 
        - User's data with more information

30) Get Submissions (GET) (/classroom/:class_id/assignment/:assignment_id/submissions)
    - Header : Bearer Token
    - Params : class_id,assignment_id
    - Conditions : 
        - Classroom should exist.
        - Submission should belong from its assignment .
        - User should be teacher or creator of the classroom.
    - Response :
        - All users submission
    
31) Get Attendances (GET) (/classroom/:class_id/resource/:resource_id/attendances)
    - Header : Bearer Token
    - Params : class_id,resource_id
    - Conditions :
        - Classroom should exist
        - User should belong from the classroom
    - Response :
        - Attendance data