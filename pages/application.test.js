
describe("Application component", () => {
  const site = "test_site";
  const page = "test_page";
  const navPage = "test_nav_page";
  const rules = "test_rules";
  const disclaimer = "test_disclaimer";
  const guaranty = "test_guaranty";
  const links = [
    { name: "test_link_1", href: "/test/href/1" },
    { name: "test_link_2", href: "/test/href/2" },
  ];
  const canEdit = true;
  const user = { id: 1, isLoggedIn: true };
  const currentLeases = [
    { leaseId: 1, leaseDescription: "test description 1", rooms: [] },
    { leaseId: 2, leaseDescription: "test description 2", rooms: [] },
  ];
  const pendingApplication = {
    lease_room_type_id: "1_2",
    share_info: true,
  };
  
  it("should have a form with the proper handlers and fields", () => {
    const component = mount(
      <Application
        site={site}
        page={page}
        navPage={navPage}
        rules={rules}
        disclaimer={disclaimer}
        guaranty={guaranty}
        links={links}
        canEdit={canEdit}
        user={user}
        currentLeases={currentLeases}
        pendingApplication={pendingApplication}
      />
    );
    const form = component.find("Form");
    expect(form).toHaveLength(1);
    expect(form.prop("onSubmit")).toBeInstanceOf(Function);
    expect(form.prop("method")).toBe("post");

    const workFormGroups = component.find("WorkFormGroups");
    expect(workFormGroups).toHaveLength(0);
    component.setProps({ site: "suu" });
    expect(component.find("WorkFormGroups")).toHaveLength(1);
    expect(workFormGroups.prop("register")).toBeInstanceOf(Function);
    expect(workFormGroups.prop("application")).toEqual(pendingApplication);
    expect(workFormGroups.prop("errors")).toEqual(undefined);

    const leaseRooms = component.find("CurrentLeases");
    expect(leaseRooms).toHaveLength(currentLeases.length);
    leaseRooms.forEach((leaseRoom, index) => {
      expect(leaseRoom.prop("register")).toBeInstanceOf(Function);
      expect(leaseRoom.prop("enabled")).toBe(
        pendingApplication === undefined ||
          pendingApplication === null ||
          pendingApplication.lease_id === leaseRoom.leaseId
      );
      expect(leaseRoom.prop("description")).toBe(
        currentLeases[index].leaseDescription
      );
      expect(leaseRoom.prop("rooms")).toEqual(currentLeases[index].rooms);
    });

    const applicationFormGroups = component.find("ApplicationFormGroups");
    expect(applicationFormGroups).toHaveLength(1);
    expect(applicationFormGroups.prop("register")).toBeInstanceOf(Function);
    expect(applicationFormGroups.prop("errors")).toEqual(undefined);

    const pageContents = component.find("PageContent");
    expect(pageContents).toHaveLength(2);
    expect(pageContents.at(0).prop("initialContent")).toBe(rules);
    expect(pageContents.at(1).prop("initialContent")).toBe(disclaimer);

    const checkBox = component.find("Form.Check");
    expect(checkBox).toHaveLength(1);
    expect(checkBox.prop("id")).toBe("installments");
    expect(checkBox.prop("value")).toBe("1");
    expect(checkBox.prop("type")).toBe("checkbox");
    expect(checkBox.prop("defaultChecked")).toBe(undefined);
    expect(checkBox.prop("setValueAs")).toBeInstanceOf(Function);
    expect(checkBox.prop("name")).toBe("installments");
    expect(checkBox.prop("ref")).toBeInstanceOf(Function);

    const button = component.find("Button");
    expect(button).toHaveLength(1);
    expect(button.prop("type")).toBe("submit");
    expect(button.prop("variant")).toBe("primary");
    expect(button.prop("disabled")).toBe(!canEdit);
  });

  it("should call fetch when submitting the form with the correct parameters and update location when response is 200", async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        status: 204,
      })
    );
    const component = mount(
      <Application
        site={site}
        page={page}
        navPage={navPage}
        rules={rules}
        disclaimer={disclaimer}
        guaranty={guaranty}
        links={links}
        canEdit={canEdit}
        user={user}
        currentLeases={currentLeases}
        pendingApplication={pendingApplication}
      />
    );
    const onSubmit = component.find("Form").prop("onSubmit");
    await onSubmit(pendingApplication, { preventDefault: () => {} });

    const expectedOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...pendingApplication,
        site: site,
        lease_id: 1,
        room_type_id: 2,
        share_info: false,
      }),
    };
    expect(fetch).toHaveBeenCalledWith(
      `/api/users/${user.id}/leases/1/application`,
      expectedOptions
    );

    expect(global.location).toEqual("/deposit");

    global.fetch.mockClear();
  });

  it("should not update location when response is not 200", async () => {
    global.location = {
      ...window.location,
      assign: jest.fn(),
    };
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        status: 400,
      })
    );
    const component = mount(
      <Application
        site={site}
        page={page}
        navPage={navPage}
        rules={rules}
        disclaimer={disclaimer}
        guaranty={guaranty}
        links={links}
        canEdit={canEdit}
        user={user}
        currentLeases={currentLeases}
        pendingApplication={pendingApplication}
      />
    );
    const onSubmit = component.find("Form").prop("onSubmit");
    await onSubmit(pendingApplication, { preventDefault: () => {} });

    expect(global.location.assign).not.toHaveBeenCalled();

    global.fetch.mockClear();
  });
});
