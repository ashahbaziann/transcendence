import { useState } from "react";
import styles from "./AuthForm.module.css"

export default function OauthButton () {

    return (
    <button className={styles.oauth} type="button">OAuth with Google</button>
    );

} 