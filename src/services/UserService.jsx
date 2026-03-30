/**
 * @fileoverview UserService — Provides user-related business logic and custom hooks.
 *
 * Exposes reusable functionality for handling user state mutations, such as
 * uploading profile avatars, integrated directly with the session and auth contexts.
 */

import { AuthError } from "@supabase/supabase-js";
import { useSession } from "../context/SessionContext";

/**
 * Custom error thrown when an operation expects a file object but none is provided.
 */
class FileNotFoundError extends Error {
    constructor(message = 'File doesnt exists') {
        super(message);
        this.name = "FileNotFoundError";
    }
}

/**
 * Custom hook that provides a scoped function to upload and update the 
 * current authenticated user's profile avatar.
 *
 * @returns {{
 *   upload: (new_avatar_file: File) => Promise<void>
 * }}
 *
 * @example
 * const { upload } = useUploadUserAvatar();
 * await upload(selectedFile);
 */
const useUploadUserAvatar = ()=>{
    const {useAuth} = useSession();
    const {user,uploadAvatar} = useAuth();
    


    const upload = async(new_avatar_file)=>{
        if (!user) throw new AuthError("User wast loged or founded");
        if (!new_avatar_file) throw new FileNotFoundError();
        await uploadAvatar(new_avatar_file, user.id);
    }

    return {upload};
}

export {useUploadUserAvatar,FileNotFoundError};