const db = require("../helpers/database/db");
const { getTimeString } = require("../helpers/functions/timeToWordDate");
const fs = require("fs");

const userClassroomStatus = ({ user_id, class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from connections where user_id=? and class_id=? and is_deleted=0;`;
    db.query(q, [user_id, class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const getUserRole = ({ user_id, class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select role from connections where class_id=? and user_id=? and is_deleted=0;`;
    db.query(q, [class_id, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const updateClassroom = ({
  class_id,
  class_name,
  class_description,
  banner_id,
}) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    var fields = [];
    if (class_name) fields.push(`class_name="${class_name}"`);
    if (class_description)
      fields.push(`class_description="${class_description}"`);
    if (banner_id) fields.push(`banner_id=${banner_id}`);
    const q = `update classrooms set ${fields.join(
      ","
    )},updated_at=? where class_id=?;`;
    db.query(q, [currentTime, class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const removeUser = ({ class_id, user_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update connections set is_deleted=1,updated_at=? where user_id=? and class_id=?;`;
    db.query(q, [currentTime, user_id, class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const updateRole = ({ class_id, user_id, role }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update connections set role=?,updated_at=? where user_id=? and class_id=?;`;
    db.query(q, [role, currentTime, user_id, class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const addResource = ({ class_id, user_id, title, body }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `insert into resources (class_id,user_id,title,body,is_deleted,created_at,updated_at) values (?);`;
    db.query(
      q,
      [[class_id, user_id, title, body, 0, currentTime, currentTime]],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const addClassDocument = ({
  class_id,
  ra_id,
  cd_id,
  cd_type,
  user_id,
  file_name,
  path,
}) => {
  return new Promise((resolve, reject) => {
    const q = `insert into class_documents (class_id,ra_id,cd_id,cd_type,user_id,file_name,path) values (?);`;
    db.query(
      q,
      [[class_id, ra_id, cd_id, cd_type, user_id, file_name, path]],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const checkResourceFlag = ({ class_id, resource_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from resources where class_id=? and resource_id=? and is_deleted=0;`;
    db.query(q, [class_id, resource_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const getResource = ({ resource_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select r.*,u.first_name as creator_first_name,u.last_name as creator_last_name,u.user_id as created_by,d.file_name as creator_profile_image from resources as r ,users as u LEFT JOIN documents as d ON u.user_id=d.user_id and d.is_deleted=0 and d.doc_type='profile' where r.resource_id=? and r.user_id=u.user_id and r.is_deleted=0;`;
    db.query(q, [resource_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        const q2 = `select cd_id,path,file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
        db.query(q2, [`r${resource_id}`], (err2, result2) => {
          if (err2) {
            reject(err2);
          } else {
            resolve({
              ...result[0],
              attachments: result2,
            });
          }
        });
      }
    });
  });
};
const deleteResource = ({ resource_id }) => {
  return new Promise((resolve, reject) => {
    const q = `update resources set is_deleted=1 where resource_id=?;`;
    db.query(q, [resource_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        const q2 = `select file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
        db.query(q2, [`r${resource_id}`], (err2, result2) => {
          if (err2) {
            reject(err2);
          } else {
            const q3 = `update class_documents set is_deleted=1 where ra_id=? and cd_type="resource";`;
            db.query(q3, [`r${resource_id}`], (err3, result3) => {
              if (err3) {
                reject(err3);
              } else {
                resolve(result2);
              }
            });
          }
        });
      }
    });
  });
};
const getResourceAttachments = ({ resource_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select cd_id,file_name from class_documents where ra_id=? and cd_type="resource" and is_deleted=0;`;
    db.query(q, [`r${resource_id}`], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const deleteResourceAttachment = ({ cd_id, file_name, class_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update class_documents set is_deleted=1 where cd_id=?;`;
    db.query(q, [cd_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        fs.unlinkSync(
          `./public/classrooms/${class_id}/resources/${file_name}`,
          (err) => {
            console.log(err);
          }
        );
        resolve(result);
      }
    });
  });
};
const updateResource = ({ resource_id, title, body }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    let fields = [];
    if (title) fields.push(`title="${title}"`);
    if (body) fields.push(`body="${body}"`);
    fields.push(`updated_at="${currentTime}"`);
    const q = `update resources set ${fields.join(",")} where resource_id=?;`;
    db.query(q, [resource_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const askQuery = ({
  resource_id,
  user_id,
  query_title,
  query_body,
  class_id,
}) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `insert into queries (class_id,resource_id,user_id,query_title,query_body,created_at,updated_at,is_deleted) values (?,?,?,?,?,?,?,0);`;
    db.query(
      q,
      [
        class_id,
        resource_id,
        user_id,
        query_title,
        query_body,
        currentTime,
        currentTime,
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const checkQueryFlag = ({ query_id, resource_id, user_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from queries where query_id=? and resource_id=? and user_id=? and is_deleted=0;`;
    db.query(q, [query_id, resource_id, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const editQuery = ({ query_id, query_title, query_body }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update queries set query_title=?,query_body=?,updated_at=? where query_id=?;`;
    db.query(q, [query_title, query_body, currentTime, query_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const deleteQuery = ({ query_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update queries set is_deleted=1,updated_at=? where query_id=?;`;
    db.query(q, [currentTime,query_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const checkQueryFlagUsingResourceId = ({ resource_id, query_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from queries where resource_id=? and query_id=? and is_deleted=0;`;
    db.query(q, [resource_id, query_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const writeSolution = ({ query_id, solution, user_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update queries set solution=?,solution_by=?,solved_at=? where query_id=?;`;
    db.query(q, [solution, user_id, currentTime, query_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const checkStudentsFlag = ({ class_id, user_ids }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from connections where class_id=? and user_id in (?) and role="student" and is_deleted=0;`;
    db.query(q, [class_id, user_ids], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const deleteOldAttendance = ({ resource_id, class_id, user_ids }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `delete from attendance where resource_id=? and class_id=? and is_deleted=0 and user_id in (?)`;
    db.query(q, [resource_id, class_id, user_ids], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const markAttendance = ({ resource_id, class_id, attendance, attend_date }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `insert into attendance (resource_id,class_id,user_id,has_attended,attend_date,is_deleted,created_at,updated_at) values ${Object.keys(
      attendance
    )
      .map(
        (i) =>
          `(${resource_id},${class_id},${i},${attendance[i]},${attend_date},0,${currentTime},${currentTime})`
      )
      .join(",")};`;
    db.query(q, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const createAssignment = ({
  class_id,
  title,
  body,
  due_date_time,
  user_id,
  total_marks,
}) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `insert into assignments (class_id,title,body,due_date_time,user_id,total_marks,created_at,updated_at) values (?,?,?,?,?,?,?,?);`;
    db.query(
      q,
      [
        class_id,
        title,
        body,
        due_date_time,
        user_id,
        total_marks,
        currentTime,
        currentTime,
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const checkAssignmentFlag = ({ class_id, assignment_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from assignments where class_id=? and assignment_id=? and is_deleted=0;`;
    db.query(q, [class_id, assignment_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const getAssignmentAttachments = ({ assignment_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select cd_id,file_name from class_documents where ra_id=? and cd_type="assignment" and is_deleted=0;`;
    db.query(q, [`a${assignment_id}`], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const deleteAssignmenteAttachment = ({ cd_id, file_name, class_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update class_documents set is_deleted=1 where cd_id=?;`;
    db.query(q, [cd_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        fs.unlinkSync(
          `./public/classrooms/${class_id}/assignments/${file_name}`,
          (err) => {
            console.log(err);
          }
        );
        resolve(result);
      }
    });
  });
};
const updateAssignment = ({
  assignment_id,
  title,
  body,
  due_date_time,
  total_marks,
}) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    let fields = [];
    if (title) {
      fields.push(`title="${title}"`);
    }
    if (body) {
      fields.push(`body="${body}"`);
    }
    if (due_date_time) {
      fields.push(`due_date_time="${due_date_time}"`);
    }
    if (total_marks) {
      fields.push(`total_marks=${total_marks}`);
    }
    fields.push(`updated_at="${currentTime}"`);
    const q = `update assignments set ${fields.join(
      ","
    )} where assignment_id=?;`;
    db.query(q, [assignment_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const deleteAssignment = ({ assignment_id, class_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `update assignments set is_deleted=1,updated_at=? where assignment_id=?;`;
    db.query(q, [currentTime, assignment_id], async (err, result) => {
      if (err) {
        reject(err);
      } else {
        const attachments = await getAssignmentAttachments({ assignment_id });
        for (var i = 0; i < attachments.length; i++) {
          await deleteAssignmenteAttachment({
            cd_id: attachments[i].cd_id,
            file_name: attachments[i].file_name,
            class_id: class_id,
          });
        }
        resolve(result);
      }
    });
  });
};
const checkedMarkedFlag = ({ assignment_id, user_id, class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select marks from submissions where assignment_id=? and user_id=? and class_id=? and is_deleted=0;`;
    db.query(q, [assignment_id, user_id, class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (result.length == 1) {
          resolve({
            flag: result[0].marks !== null,
          });
        } else {
          resolve({
            flag: false,
          });
        }
      }
    });
  });
};
const getDueDate = ({ assignment_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select due_date_time from assignments where assignment_id=?;`;
    db.query(q, [assignment_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const submitAssignment = ({
  class_id,
  assignment_id,
  user_id,
  file_name,
  path,
}) => {
  return new Promise(async (resolve, reject) => {
    const currentTime = getTimeString();
    const q = `insert into submissions (class_id,assignment_id,user_id,file_name,path,marks,created_at,updated_at,is_deleted) values (?,?,?,?,?,?,?,?,?);`;
    await deleteAssignmentSubmission({ class_id, assignment_id, user_id });
    db.query(
      q,
      [
        class_id,
        assignment_id,
        user_id,
        JSON.stringify(file_name),
        JSON.stringify(path),
        null,
        currentTime,
        currentTime,
        0,
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const getSubmissionAttachment = ({ submission_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select file_name,path from submissions where submission_id=?;`;
    db.query(q, [submission_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const deleteAssignmentSubmission = ({ class_id, assignment_id, user_id }) => {
  return new Promise((resolve, reject) => {
    const currentTime = getTimeString();
    const q = `select submission_id from submissions where class_id=? and assignment_id=? and user_id=? and is_deleted=0;`;
    db.query(q, [class_id, assignment_id, user_id], (err2, result2) => {
      if (err2) {
        reject(err2);
      } else {
        const q = `update submissions set is_deleted=1,updated_at=? where class_id=? and assignment_id=? and submission_id=? and is_deleted=0;`;
        db.query(
          q,
          [currentTime, class_id, assignment_id, result2[0]?.submission_id],
          async (err, result) => {
            if (err) {
              reject(err);
            } else {
              if (result2[0]) {
                let attachments = await getSubmissionAttachment({
                  submission_id: result2[0].submission_id,
                });
                attachments = await JSON.parse(attachments.file_name);
                for (var i = 0; i < attachments.length; i++) {
                  fs.unlinkSync(
                    `./public/classrooms/${class_id}/assignments/submissions/${attachments[i]}`,
                    (err) => {
                      console.log(err);
                    }
                  );
                }
              }
              resolve(result);
            }
          }
        );
      }
    });
  });
};
const checkSubmissionFlag = ({ class_id, assignment_id, submission_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select count(*) as flag from submissions where class_id=? and assignment_id=? and submission_id=? and is_deleted=0;`;
    db.query(q, [class_id, assignment_id, submission_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const markSubmission = ({ submission_id, marks }) => {
  return new Promise((resolve, reject) => {
    const q = `update submissions set marks=? where submission_id=?;`;
    db.query(q, [marks, submission_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const getTotalMarks = ({ assignment_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select total_marks from assignments where assignment_id=?;`;
    db.query(q, [assignment_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const getClassroomResources = ({ class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select r.resource_id,r.title,r.body,r.class_id,r.user_id as created_by,u.first_name as creator_first_name,u.last_name as creator_last_name,r.created_at,r.updated_at,d.file_name as creator_profile_image from resources as r,users as u LEFT JOIN documents as d ON u.user_id=d.user_id and d.is_deleted=0 and d.doc_type='profile' where r.class_id=? and r.is_deleted=0 and r.user_id=u.user_id order by r.created_at;`;
    db.query(q, [class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const getClassroomAssignments = ({ class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select a.assignment_id,a.title,a.body,a.due_date_time,a.total_marks,a.user_id as created_by,a.created_at,a.updated_at,u.first_name as creator_first_name,u.last_name as creator_last_name,d.file_name as creator_profile_image from assignments as a,users as u LEFT JOIN documents as d ON u.user_id=d.user_id and d.is_deleted=0 and d.doc_type='profile' where a.class_id=? and a.is_deleted=0 and a.user_id=u.user_id order by a.created_at;`;
    db.query(q, [class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const getAssignment = ({ assignment_id, user_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select a.assignment_id,a.title,a.body,a.due_date_time,a.created_at,a.updated_at,a.total_marks,a.user_id,u.first_name as creator_first_name,u.last_name as creator_last_name,u.user_id as created_by,d.file_name as creator_profile_image from assignments as a ,users as u LEFT JOIN documents as d ON u.user_id=d.user_id and d.is_deleted=0 and d.doc_type='profile' where a.user_id=u.user_id and a.assignment_id=?;`;
    db.query(q, [assignment_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        const q2 = `select cd_id,path,file_name from class_documents where ra_id=? and cd_type="assignment" and is_deleted=0;`;
        db.query(q2, [`a${assignment_id}`], (err2, result2) => {
          if (err2) {
            reject(err2);
          } else {
            const q3 = `select submission_id,path,file_name,marks from submissions where assignment_id=? and user_id=? and is_deleted=0;`;
            db.query(q3, [assignment_id, user_id], (err3, result3) => {
              if (err3) {
                reject(err3);
              } else {
                resolve({
                  ...result[0],
                  attachments: result2,
                  submissions: result3[0]
                    ? {
                        ...result3[0],
                        path: JSON.parse(result3[0].path),
                        file_name: JSON.parse(result3[0].file_name),
                      }
                    : null,
                });
              }
            });
          }
        });
      }
    });
  });
};
const getUserQuery = ({ class_id, resource_id, user_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select q.query_id,q.query_title,q.query_body,q.solution,q.solution_by,q.solved_at,q.created_at,q.updated_at,
    q.user_id,u.first_name as solver_first_name,u.last_name as solver_last_name,d.file_name as solver_profile_image from queries 
    as q LEFT JOIN users as u ON q.solution_by=u.user_id LEFT JOIN documents as d ON u.user_id=d.user_id and d.is_deleted=0 and d.doc_type='profile' 
    where q.class_id=? and q.resource_id=? and q.user_id=? and q.is_deleted=0 ORDER BY q.created_at desc;`;
    db.query(q, [class_id, resource_id, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const getClassroomSensitive = ({ class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select class_name,class_id,class_description,join_code,banner_id,created_at,updated_at from classrooms where class_id=?;`;
    db.query(q, [class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
};
const getClassroomClass = ({ class_id }) => {
  return new Promise((resolve, reject) => {
    const q = `select c.user_id,c.role,c.updated_at,c.created_at,u.first_name,u.last_name,d.file_name from 
    connections as c LEFT JOIN users as u ON u.user_id=c.user_id LEFT JOIN documents as d ON d.is_deleted=0 and u.user_id=d.user_id and d.doc_type='profile' 
    where c.is_deleted=0 and c.class_id=?;`;
    db.query(q, [class_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      } 
    })
  });
};
const getUserClassProfile = ({ class_id, user_id }) => {
  const q = `select c.user_id,c.role,c.updated_at,c.created_at,u.first_name,u.last_name,d.file_name,u.email,u.dob,u.city,u.country,u.state,u.phone_no,u.bio from 
    connections as c LEFT JOIN users as u ON u.user_id=c.user_id LEFT JOIN documents as d ON d.is_deleted=0 and u.user_id=d.user_id and d.doc_type='profile' 
    where c.is_deleted=0 and c.class_id=? and c.user_id=?;`;
  return new Promise((resolve, reject) => {
    db.query(q, [class_id, user_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]??null);
      }
    });
  });
}
const getAssignmentSubmissions = ({class_id,assignment_id }) => {
  return new Promise((resolve, reject) => {
    const q = `
      SELECT 
          s.submission_id, s.user_id, s.marks, s.created_at, s.file_name as submission,
          u.first_name, u.last_name, u.email, u.phone_no,
          (
              SELECT d.file_name 
              FROM documents d 
              WHERE d.user_id = c.user_id AND d.doc_type = 'profile' and d.is_deleted = 0
              LIMIT 1
          ) AS profile_image
      FROM 
          connections c
      LEFT JOIN 
          submissions s ON s.user_id = c.user_id AND s.assignment_id = ${assignment_id} AND s.is_deleted = 0
      LEFT JOIN 
          users u ON u.user_id = c.user_id
      WHERE 
          c.role = 'student' AND c.class_id = ${class_id} AND c.is_deleted = 0;

    `;
    db.query(q, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
module.exports = {
  userClassroomStatus,
  getClassroomAssignments,
  getClassroomResources,
  getUserQuery,
  markSubmission,
  getAssignment,
  checkSubmissionFlag,
  getTotalMarks,
  getDueDate,
  deleteAssignmentSubmission,
  checkedMarkedFlag,
  submitAssignment,
  deleteAssignment,
  updateAssignment,
  deleteAssignmenteAttachment,
  getAssignmentAttachments,
  checkAssignmentFlag,
  createAssignment,
  deleteOldAttendance,
  markAttendance,
  checkStudentsFlag,
  writeSolution,
  getClassroomSensitive,
  checkQueryFlagUsingResourceId,
  deleteQuery,
  editQuery,
  checkQueryFlag,
  askQuery,
  getUserClassProfile,
  updateResource,
  deleteResourceAttachment,
  getResourceAttachments,
  getResource,
  removeUser,
  updateRole,
  getUserRole,
  updateClassroom,
  addResource,
  addClassDocument,
  checkResourceFlag,
  deleteResource,
  getClassroomClass,
  getAssignmentSubmissions
};
