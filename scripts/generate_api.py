import os
import xml.etree.ElementTree as ET

XML_DIR = "docs/api/xml"
OUT_DIR = "docs/api"

def get_text(element, tag):
    found = element.find(tag)
    return found.text if found is not None else ""

def parse_class(refid):
    xml_path = os.path.join(XML_DIR, f"{refid}.xml")
    if not os.path.exists(xml_path):
        return None
    
    tree = ET.parse(xml_path)
    root = tree.getroot()
    compound = root.find("compounddef")
    
    name = compound.find("compoundname").text
    brief = compound.find("briefdescription")
    brief_text = "".join(brief.itertext()).strip() if brief is not None else ""
    
    detailed = compound.find("detaileddescription")
    detailed_text = "".join(detailed.itertext()).strip() if detailed is not None else ""
    
    methods = []
    for section in compound.findall("sectiondef"):
        if section.get("kind") in ["public-func", "public-static-func"]:
            for member in section.findall("memberdef"):
                m_name = member.find("name").text
                m_type = "".join(member.find("type").itertext())
                m_args = member.find("argsstring").text
                m_brief = member.find("briefdescription")
                m_brief_text = "".join(m_brief.itertext()).strip() if m_brief is not None else ""
                methods.append({
                    "name": m_name,
                    "type": m_type,
                    "args": m_args,
                    "brief": m_brief_text
                })
    
    return {
        "name": name,
        "brief": brief_text,
        "detailed": detailed_text,
        "methods": methods
    }

def main():
    index_path = os.path.join(XML_DIR, "index.xml")
    if not os.path.exists(index_path):
        print("XML index not found!")
        return

    tree = ET.parse(index_path)
    root = tree.getroot()
    
    api_nav = []
    
    for compound in root.findall("compound"):
        kind = compound.get("kind")
        if kind in ["class", "struct"]:
            refid = compound.get("refid")
            data = parse_class(refid)
            if not data:
                continue
            
            safe_name = data['name'].replace("::", "_").lower()
            file_path = os.path.join(OUT_DIR, f"{safe_name}.md")
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# {data['name']}\n\n")
                if data['brief']:
                    f.write(f"**{data['brief']}**\n\n")
                if data['detailed']:
                    f.write(f"{data['detailed']}\n\n")
                
                f.write("## Public Methods\n\n")
                for m in data['methods']:
                    f.write(f"### `{m['name']}`\n")
                    f.write(f"```cpp\n{m['type']} {m['name']}{m['args']}\n```\n")
                    if m['brief']:
                        f.write(f"{m['brief']}\n\n")
                    f.write("\n")
            
            api_nav.append(f"    - {data['name']}: api/{safe_name}.md")
    
    # Generate API Index
    with open(os.path.join(OUT_DIR, "index.md"), "w", encoding="utf-8") as f:
        f.write("# API Reference\n\n")
        f.write("This section contains the automatically generated API documentation for the Async Task Scheduler.\n\n")
        f.write("## Classes & Structs\n\n")
        for nav_item in api_nav:
            name = nav_item.split(": ")[0].strip("- ")
            link = nav_item.split(": ")[1]
            f.write(f"- [{name}]({os.path.basename(link)})\n")

    print("\n".join(api_nav))

if __name__ == "__main__":
    main()
