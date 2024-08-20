export default function Navbar() {
    return (
  

<nav className="w-full bg-gray-800 p-4">
<div className="max-w-5xl mx-auto flex justify-between items-center">
  {/* <div className="text-white text-lg font-bold">CTRL+x</div> */}
  <div className="text-white text-lg font-bold">
  <img src="/ctrlxicon.png" alt="CTRL+x Icon" className="h-8 w-8" />
</div>
  <div className="space-x-4">
    <a href="/" className="text-gray-300 hover:text-white">Home</a>
    <a href="/about" className="text-gray-300 hover:text-white">About</a>
    <a href="/library" className="text-gray-300 hover:text-white">Library</a>
    <a href="#contact" className="text-gray-300 hover:text-white">Licence</a>
  </div>
</div>
</nav>
    );
  }
