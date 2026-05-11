import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // make sure path is correct
import styles from "./AuthForm.module.css";

// function to handle API call
// async function loginUser(data) {
//   const response = await fetch("http://localhost:3005/auth/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   }
// );
//   return response.json();
// }

async function loginUser(data) {
  const response = await fetch("http://localhost:3005/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data: resData,
  };
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ correct place

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function loginUser(data) {
    const response = await fetch("http://localhost:3005/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data: resData,
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      if (!res.ok) {
        alert(res.data.error || "Login failed");
        return;
      }

      console.log("Token:", res.data.token);

      // ✅ IMPORTANT: use context login (not just localStorage)
      await login(res.data.token);

      alert("Logged in successfully!");
      navigate("/game");

    } catch (err) {
      console.error("Error:", err);
      alert("Network error!");
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

        <button className={styles.button} type="submit">
          Log In
        </button>
      </form>
    </div>
  );
}