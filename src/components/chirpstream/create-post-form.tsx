import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/lib/data";

export function CreatePostForm() {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
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
