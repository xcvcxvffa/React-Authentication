import React from "react";
import Navbar from "../Components/Context/Navbar";
import Header from "../Components/Context/Header";

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center-center  min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center ">
      <Navbar />
      <Header />
    </div>
  );
};

export default Home;
