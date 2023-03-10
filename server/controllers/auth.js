const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection(process.env.JAWSDB_URL);

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("login", {
        message: "Provide an email and/or password",
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        console.log("test test");
        console.log(results);
        let pass = await bcrypt.compare(password, results[0].password);
        console.log(pass);
        //comparing passwords that somone typed in login with hashed database password
        if (
          !results ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.status(401).render("login", {
            message: "Incorrect email or password",
          });
        } else {
          res.cookie('username', results[0].name)
          res.cookie('bio', results[0].bio)
          res.cookie('user_id', results[0].id)
          res.cookie('logged_in', '1')
          res.status(200).redirect("/");
        }
      }
    );
  } catch (error) {
    console.log("error ERROR");
    console.log(error);
  }
};

exports.register = (req, res) => {
  console.log(req.body);

  const { name, email, password, passwordConfirm } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }
      console.log("result");
      console.log(result);
      if (result.length > 0) {
        return res.render("register", {
          message: "Email already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Password do not match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      console.log(hashedPassword);

      db.query(
        "INSERT INTO users SET ? ",
        { name: name, email: email, password: hashedPassword },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            return res.render("login");
          }
        }
      );
    }
  );
  // res.send("Form Submitted")
};
