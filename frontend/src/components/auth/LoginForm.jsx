import { useState } from "react";
import styles from "./AuthForm.module.css"

// function to handle API call
async function loginUser(data) {
  const response = await fetch("http://localhost:3005/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }
);
  return response.json();
}


export default function LoginForm() {
  // state to store input values
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // update state when user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh

    try {
      const res = await registerUser(form); // call backend
      console.log("Response:", res); // for now just log
      alert("Legged In successfully!"); // simple feedback
    } catch (err) {
      console.error("Error:", err);
      alert("Logging in failed!");
    }
  };

  return (
    <div>
      <form className={styles.card} onSubmit={handleSubmit}>
         <h2 className={styles.title}>Log In</h2>
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
            <button className={styles.button} type="submit">Log In</button>
          </form>
    </div>
  );
}
