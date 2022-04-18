import './App.css';
import ImageUploader from './Components/ImageUploader';

function App() {

  const handleImageUploaderSubmit = (value) => {
    console.log(value,"@@value")
  }

  return (
    <div className="App">
      <ImageUploader maxFileUpload={6} onSubmit={handleImageUploaderSubmit}/>
    </div>
  );
}

export default App;
