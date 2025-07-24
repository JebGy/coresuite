"use client"
import React, { FormEvent, FormEventHandler } from "react";

function page() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {};

  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
        <input type="email" />
        <input type="password" />
        <button type="submit"></button>
      </form>
    </div>
  );
}

export default page;
