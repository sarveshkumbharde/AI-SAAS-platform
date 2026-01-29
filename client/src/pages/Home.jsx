import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonials from '../components/Testimonials'
import Plan from './Plan'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const {user} = useAuth();
  console.log("user", user)
  return (
    <>
      <Navbar />
      <Hero />
      <AiTools />
      <Testimonials />
      <Plan />
      <Footer />
    </>
  )
}

export default Home
