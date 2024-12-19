import express from 'express';


const app = express();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({message: "Server is running"});
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});