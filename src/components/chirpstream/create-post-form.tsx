import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";


export function CreatePostForm() {
  const { user } = useAuth();

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? ""} />
        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <Textarea
          placeholder="What's happening?"
          className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus:border-primary pb-2 px-0"
        />
        <div className="flex justify-end mt-2">
          <Button>Post</Button>
        </div>
      </div>
    </div>
  );
}
