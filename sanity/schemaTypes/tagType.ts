import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const tagType = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "The name of the tag",
      validation: (Rule) => Rule.required().error("Tag name is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("Slug is required"),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "A brief description of the tag (optional)",
      validation: (Rule) =>
        Rule.max(150).warning("Keep the description under 150 characters"),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
    },
    prepare(selection) {
      return {
        ...selection,
        subtitle: selection.subtitle || "No description provided",
      };
    },
  },
});
