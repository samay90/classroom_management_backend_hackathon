# 📚 Classroom Management Backend

## 🚀 Release Notes

**Resource Link:** [Google Drive](https://drive.google.com/drive/folders/1fich77mtOneY6YfTKM0V2yyNBf5hHt3e?usp=sharing)

---

## 🧾 Auth Routes

### 1. **Sign Up** `POST /auth/signup`
- **Allowed Fields:** `email`, `password`, `first_name`, `last_name`
- **Required:** All fields
- **Validations:**
  - All must be strings
  - `email` must be valid formats
  - `password` must include at least 1 special character
- **Response:** `token`

### 2. **Login** `POST /auth/login`
- **Allowed Fields:** `authenticator`, `password`
- **Required:** All fields
- **Validations:**
  - User must be verified and not deleted
  - `authenticator` can be email or phone
  - Valid `password`
- **Response:** `slug`

### 34. **Verify** `POST /auth/verify/:slug`
- **Allowed Fields:** `code`
- **Validations:**
  - User must be not verified
  - `code` is the otp
  - Valid `slug` and `code`
- **Response:** `token`

---

## 👤 User Routes

### 3. **Update Profile** `POST /user/profile/update`
- **Header:** Bearer Token
- **Allowed Fields:** `first_name`, `last_name`, `dob`, `bio`, `profile`, `city`, `state`, `country`
- **Required:** At least 1 field
- **Validations:**
  - Text fields must be strings
  - `dob`: valid date
  - `profile`: PNG/JPG/JPEG, max size 1MB

### 4. **View Profile** `GET /user/profile`
- **Header:** Bearer Token
- **Response:** User data

---

## 🏫 Classroom Routes

### 5. **Create Classroom** `POST /user/class/new`
- **Header:** Bearer Token
- **Fields:** `class_name`, `class_description` (required, strings)
- **Response:** `join_code`

### 6. **Join Classroom** `POST /user/class/join`
- **Header:** Bearer Token
- **Fields:** `join_code` (required, string)
- **Validations:** Must not already be part of the class

### 7. **Update Classroom** `POST /classroom/:class_id/edit`
- **Header:** Bearer Token
- **Allowed Fields:** `class_name`, `class_description`, `banner_id`
- **Validations:**
  - `banner_id` must be a number
  - Must be class creator

### 8. **Manage Classroom** `POST /classroom/:class_id/manage`
- **Header:** Bearer Token
- **Fields:** `user_id`, `action_type (R/M)`, `action (T/S)`
- **Validations:**
  - Both users must be in class
  - Cannot modify self
  - Must be creator

---

## 📁 Resource Routes

### 9. **Add Resource** `POST /classroom/:class_id/resource/new`
- **Header:** Bearer Token
- **Fields:** `title` (required, < 50 chars), `body (< 200 chars)`, `attachments`
- **Must be:** Creator/Teacher

### 10. **View Resource** `GET /classroom/:class_id/resource/:resource_id`
- **Header:** Bearer Token
- **Validations:** User must be part of class, resource must exist and not be deleted

### 11. **Delete Resource** `POST /classroom/:class_id/resource/:resource_id/delete`
- **Header:** Bearer Token
- **Must be:** Creator/Teacher

### 12. **Edit Resource** `POST /classroom/:class_id/resource/:resource_id/edit`
- **Header:** Bearer Token
- **Allowed Fields:** `title`, `body`, `delete_attachments`, `attachments`
- **Validations:**
  - `title` < 50 chars, `body` < 200 chars
  - `delete_attachments`: stringified array of IDs

---

## ❓ Query Routes

### 13. **Ask Query** `POST /classroom/:class_id/resource/:resource_id/query/ask`
- **Header:** Bearer Token
- **Fields:** `query_body` (required), `query_title` (< 50 chars)
- **Must be:** Student of classroom

### 14. **Edit Query** `POST /classroom/:class_id/resource/:resource_id/query/:query_id/edit`
- **Header:** Bearer Token
- **Validations:** Same as Ask Query + must own query

### 15. **Delete Query** `DELETE /classroom/:class_id/resource/:resource_id/query/:query_id/delete`
- **Header:** Bearer Token
- **Must be:** Owner of query and student

### 16. **Solve Query** `POST /classroom/:class_id/resource/:resource_id/query/:query_id/solve`
- **Header:** Bearer Token
- **Field:** `solution` (< 500 chars)
- **Must be:** Creator/Teacher

---

## 📝 Attendance Routes

### 17. **Mark Attendance** `POST /classroom/:class_id/resource/:resource_id/attendance/mark`
- **Header:** Bearer Token
- **Field:** `attendance` JSON: `{ "user_id": 0 | 1, ... }`
- **Validations:** Users must be students, class exists

---

## 📌 Assignment Routes

### 18. **Assign Assignment** `POST /classroom/:class_id/assignments/new`
- **Header:** Bearer Token
- **Fields:** `title`, `due_date_time`, `total_marks` (required)
- **Validations:** Must be teacher/creator

### 19. **Edit Assignment** `POST /classroom/:class_id/assignment/:assignment_id/edit`
- **Header:** Bearer Token
- **Fields:** Same as assign + `delete_attachments`
- **Validations:** Same as assign

### 20. **Delete Assignment** `POST /classroom/:class_id/assignment/:assignment_id/delete`
- **Header:** Bearer Token
- **Must be:** Creator/Teacher

### 21. **Submit Assignment** `POST /classroom/:class_id/assignment/:assignment_id/submit`
- **Header:** Bearer Token
- **Fields:** `attachments` (required)
- **Validations:**
  - Must be before due date
  - Deletes previous unmarked submission

### 22. **Mark Assignment** `POST /classroom/:class_id/assignment/:assignment_id/submission/:submission_id`
- **Header:** Bearer Token
- **Field:** `marks`
- **Validations:** Submission must exist and `marks < total_marks`

---

## 📦 Get Routes

### 23. **Get User Classrooms** `GET /user/classrooms`
- **Header:** Bearer Token

### 24. **Get Classroom Data** `GET /classroom/:class_id?page=[page_no]`
- **Header:** Bearer Token
- **Returns:** All classroom content

### 25. **Get Assignment** `GET /classroom/:class_id/assignment/:assignment_id`
- **Header:** Bearer Token

### 26. **Get Queries** `GET /classroom/:class_id/resource/:resource_id/queries`
- **Header:** Bearer Token

### 27. **Get Classroom Sensitive Info** `GET /classroom/:class_id/sensitive`
- **Header:** Bearer Token
- **Must be:** Creator

### 28. **Get Classmates** `GET /classroom/:class_id/class`
- **Header:** Bearer Token

### 29. **Get User Data in Class** `GET /classroom/:class_id/class/:user_id`
- **Header:** Bearer Token

### 30. **Get Submissions** `GET /classroom/:class_id/assignment/:assignment_id/submissions`
- **Header:** Bearer Token
- **Must be:** Creator/Teacher

### 31. **Get Attendances** `GET /classroom/:class_id/resource/:resource_id/attendances`
- **Header:** Bearer Token

### 32. **Get Classwork** `GET /classroom/:class_id/classwork`
- **Header:** Bearer Token

### 33. **Get Topics** `GET /classroom/:class_id/topics`
- **Header:** Bearer Token

---

> ✍️ For more info or updates, refer to the shared [resource folder](https://drive.google.com/drive/folders/1fich77mtOneY6YfTKM0V2yyNBf5hHt3e?usp=sharing).