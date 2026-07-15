const BASE_URL = "http://localhost:5000/api";


export const getToken = () =>
  localStorage.getItem("token");


export const setToken = (token) => {
  localStorage.setItem("token", token);
};


export const removeToken = () => {
  localStorage.removeItem("token");
};


export const clearToken = () => {
  removeToken();
};


export const getFileUrl = (filePath) => {

  if (!filePath) return "";

  if (filePath.startsWith("http")) {
    return filePath;
  }

  const BASE_FILE_URL = "http://localhost:5000";

  return `${BASE_FILE_URL}/${filePath.replace(/^\/+/, "")}`;
};



async function request(endpoint, options = {}) {

  const token = getToken();


  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };


  if(token){
    headers.Authorization = `Bearer ${token}`;
  }


  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );


  const data = await response.json();


  if(!response.ok){

    throw new Error(
      data.message || "Request Failed"
    );

  }


  return data.data || data;

}



export const api = {


  login:(body)=>
    request("/auth/login",{
      method:"POST",
      body:JSON.stringify(body)
    }),



  register:(body)=>
    request("/auth/register",{
      method:"POST",
      body:JSON.stringify(body)
    }),



  // Dashboard stats
  getStats:()=>
    request("/dashboard/stats"),



  // Landing page stats
  getLandingStats:()=>
    request("/landing"),



  get:(endpoint)=>
    request(endpoint),



  post:(endpoint,body)=>
    request(endpoint,{
      method:"POST",
      body:JSON.stringify(body)
    }),



  put:(endpoint,body)=>
    request(endpoint,{
      method:"PUT",
      body:JSON.stringify(body)
    }),



  patch:(endpoint,body)=>
    request(endpoint,{
      method:"PATCH",
      body:JSON.stringify(body)
    }),



  delete:(endpoint)=>
    request(endpoint,{
      method:"DELETE"
    }),



  list:(name)=>
    request(`/${name}`),



  create:(name,body)=>
    request(`/${name}`,{
      method:"POST",
      body:JSON.stringify(body)
    }),



  update:(name,id,body)=>
    request(`/${name}/${id}`,{
      method:"PUT",
      body:JSON.stringify(body)
    }),

     updateAppointmentStatus:(id,status)=>
    request(`/appointments/status/${id}`,{
      method:"PUT",
      body:JSON.stringify({
        status
      })
    }),

  remove:(name,id)=>
    request(`/${name}/${id}`,{
      method:"DELETE"
    })

};