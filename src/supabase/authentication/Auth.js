import { supabase } from "../../supabaseClient";
class Auth {
   login = async (values = { email: "", password: "" }) => {
    const { email, password } = values || {};
    console.log("values", values);
    return new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
             email,
             password,
           });
        if (error) {
           throw new Error(error.message);
        };
        resolve(data);
      } catch (error) {
        console.log(error);
        reject(error?.message || error ||  'Error authenticating user');
      }
    });
  };
}
const AuthService = new Auth();
export { AuthService };