import { useState } from "react";

// function to handle API call
//async function registerUser(data) {
//   const response = await fetch("http://localhost:3000/api/auth/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   return response.json();
// }

async function registerUser(data) {
  const response = await fetch("http://localhost:3005/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }
);
  return response.json();
}

export default function RegisterForm() {
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

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh

    try {
      const res = await registerUser(form); // call backend
      console.log("Response:", res); // for now just log
      alert("Registered successfully!"); // simple feedback
    } catch (err) {
      console.error("Error:", err);
      alert("Registration failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}
