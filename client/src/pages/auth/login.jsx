import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false); // ✅ ADDED
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  // ✅ MODIFY ONLY PASSWORD FIELD TYPE (NO DELETION)
  const updatedFormControls = loginFormControls.map((control) =>
    control.name === "password"
      ? {
          ...control,
          type: showPassword ? "text" : "password",
          rightIcon: (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ),
        }
      : control
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-6 auth-card">
      <div className="text-center space-y-4">
        {/* LOGO */}
        <div className="flex justify-center">
          <img
            src="/logo.jpeg"
            alt="Mr.Prefect Logo"
            className="h-16 w-16 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>

        <p className="mt-2">
          Don't have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={updatedFormControls} // ✅ ONLY THIS CHANGED
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;
