import { SearchBar } from "../chirpstream/search-bar";
import { WhoToFollow } from "../chirpstream/who-to-follow";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function RightSidebar() {
  return (
    <div className="sticky top-6 flex flex-col gap-6">
      <SearchBar />
      <Card className="bg-secondary/50 border-none">
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <WhoToFollow />
        </CardContent>
      </Card>
    </div>
  );
}
