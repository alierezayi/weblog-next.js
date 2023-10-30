import CardList from "@/components/CardList";
import Menu from "@/components/Menu";

const BlogPage = ({ searchParams }) => {
  const page = parseInt(searchParams.page) || 1;
  const { cat } = searchParams;

  return (
    <div className="my-16">
      <h1 className="bg-[#FF7F50] text-white py-2 px-3 font-semibold text-lg text-center capitalize rounded-lg">
        {cat} Blog
      </h1>
      <div className="flex gap-12">
        <CardList page={page} cat={cat} />
        <Menu />
      </div>
    </div>
  );
};

export default BlogPage;