import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthForm.module.css"


// function to handle API call
async function registerUser(data) {
  const response = await fetch("http://localhost:3005/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    // throw backend error so catch() runs
    throw result;
  }

  return result;
} 

export default function RegisterForm() {
  const navigate = useNavigate();
  // state to store input values
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // update state when user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // // handle form submit
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const res = await registerUser(form);

  //     console.log("Success:", res);
  //     alert(res.message || "Registered successfully!");

  //     // navigate("/game");
  //   } catch (err) {
  //     console.error("Error:", err);
  //     alert(err.error || "Registration failed!");
  //   }
  // };


   const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser(form);
      console.log("Success:", res);
      setForm({ username: "", email: "", password: "" }); // clear form
      alert(res.message || "Registered successfully!");
     // navigate("/login"); // redirect to login
    } catch (err) {
      console.error("Error:", err);
      alert(err.error || "Registration failed!");
    }
  };

  return (
    <div>
      <form className={styles.card} onSubmit={handleSubmit}>
         <h2 className={styles.title}>Register</h2>
            <input
              className={styles.input}
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button className={styles.button} type="submit">Register</button>
          </form>
    </div>
  );
}
