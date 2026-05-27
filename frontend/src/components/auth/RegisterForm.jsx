import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthForm.module.css"


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
    throw result;
  }

  return result;
} 

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await registerUser(form);
    console.log("Success:", res);
    setForm({ username: "", email: "", password: "" }); 
    alert(res.message || "Registered successfully!");
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
